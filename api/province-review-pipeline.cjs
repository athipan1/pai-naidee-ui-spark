'use strict';
const {randomUUID}=require('node:crypto');
const {PROVINCE_EN}=require('./place-localizations.cjs');
const {cleanPlace}=require('./admin-cms.cjs');
const {cleanEvidence,payloadHash}=require('./place-review-evidence.cjs');
const {evaluateReview,audit}=require('./place-review-workflow.cjs');
const {duplicateDecision,independentUrl}=require('./place-candidate-quality.cjs');
const {createRateLimiter}=require('./security.cjs');
function validateProvinceBatch(input) {
  if(!input||!Object.hasOwn(PROVINCE_EN,input.province)||!Array.isArray(input.candidates)||input.candidates.length<1||input.candidates.length>20||
    typeof input.requestKey!=='string'||!/^[A-Za-z0-9_-]{8,100}$/.test(input.requestKey))return {error:'Known province, stable request key and 1–20 candidates required.'};
  const candidates=[];
  for(const raw of input.candidates) {
    const parsed=cleanPlace(raw?.payload),evidence=cleanEvidence(raw?.evidence);
    if(parsed.errors.length||evidence.error||parsed.value.province!==input.province||
      !independentUrl(evidence.value?.source.url))return {error:'Every candidate needs valid independent source evidence and the selected province.'};
    candidates.push({payload:parsed.value,evidence:evidence.value,targetPlaceId:null});
  }
  return {value:{province:input.province,requestKey:input.requestKey,candidates}};
}
function registerProvinceReviewPipeline(app,{getSql,requireAdmin}) {
  const wrap=handler=>async(req,res)=>{try{await handler(req,res);}catch{
    if(req.method==='POST'&&req.params.jobId)try{await getSql()`UPDATE province_import_jobs SET state='FAILED',updated_at=NOW()
      WHERE id=${req.params.jobId} AND state<>'REVIEW_PENDING'`;}catch{/* Keep the previous durable checkpoint on database failure. */}
    res.status(503).json({error:'Province review unavailable; no publication was performed. Check approved review schema and job status.'});}};
  app.post('/api/admin/province-import-jobs',requireAdmin,createRateLimiter({windowMs:60000,max:6,keyPrefix:'province-stage'}),wrap(async(req,res)=>{
    const parsed=validateProvinceBatch(req.body);if(parsed.error)return res.status(400).json({error:parsed.error});
    const {province,requestKey,candidates}=parsed.value,hash=payloadHash({province,candidates});
    const result=await getSql().begin(async tx=>{
      // One bounded request creates drafts only, never public place rows.
      // Advisory locking serializes retries of the same idempotency key.
      await tx`SELECT pg_advisory_xact_lock(hashtext(${requestKey}))`;
      const [existing]=await tx`SELECT * FROM province_import_jobs WHERE request_key=${requestKey}`;
      if(existing)return existing.input_hash===hash?{...existing,idempotent:true}:{code:409,error:'Request key already used with different input.'};
      const id=randomUUID();
      const [job]=await tx`INSERT INTO province_import_jobs(id,province,request_key,input_hash,candidate_count,created_by)
        VALUES(${id},${province},${requestKey},${hash},${candidates.length},${req.auth.user.id}) RETURNING *`;
      for(let index=0;index<candidates.length;index++) {
        const candidate=candidates[index],draftId=randomUUID(),contentHash=payloadHash(candidate.payload);
        await tx`INSERT INTO place_drafts(id,payload,author_id) VALUES(${draftId},${tx.json(candidate.payload)},${req.auth.user.id})`;
        await tx`INSERT INTO place_reviews(draft_id,state,evidence,payload_hash) VALUES(${draftId},'DISCOVERED',${tx.json(candidate.evidence)},${contentHash})`;
        await tx`INSERT INTO province_import_candidates(job_id,ordinal,draft_id) VALUES(${id},${index},${draftId})`;
        await audit(tx,draftId,req.auth.user.id,'discover',null,'DISCOVERED',candidate.evidence,contentHash);
      }
      return {...job,publicationAllowed:false};
    });res.status(result.code||200).json(result);
  }));
  app.get('/api/admin/province-import-jobs/:jobId',requireAdmin,wrap(async(req,res)=>{
    const [job]=await getSql()`SELECT * FROM province_import_jobs WHERE id=${req.params.jobId}`;
    res.status(job?200:404).json(job?{...job,publicationAllowed:false}:{error:'Import job not found.'});
  }));
  app.post('/api/admin/province-import-jobs/:jobId/resume',requireAdmin,createRateLimiter({windowMs:60000,max:10,keyPrefix:'province-resume'}),wrap(async(req,res)=>{
    const result=await getSql().begin(async tx=>{
      await tx`SET LOCAL statement_timeout = '8000ms'`;
      const [job]=await tx`SELECT * FROM province_import_jobs WHERE id=${req.params.jobId} FOR UPDATE`;
      if(!job)return {code:404,error:'Import job not found.'};
      if(job.state==='REVIEW_PENDING')return {...job,idempotent:true,publicationAllowed:false};
      const drafts=await tx`SELECT d.*,r.evidence,r.media_probe,r.payload_hash,r.state AS review_state,c.ordinal
        FROM province_import_candidates c JOIN place_drafts d ON d.id=c.draft_id JOIN place_reviews r ON r.draft_id=d.id
        WHERE c.job_id=${job.id} ORDER BY c.ordinal FOR UPDATE OF d,r`;
      if(drafts.length!==job.candidate_count)throw Error('Incomplete job candidate set');
      const summaries=Array.isArray(job.result)?[...job.result]:[];
      const end=Math.min(job.next_index+5,drafts.length);
      for(let index=job.next_index;index<end;index++) {
        const draft=drafts[index];
        if(draft.status!=='draft'||draft.review_state!=='DISCOVERED')throw Error('Candidate has already been edited/reviewed; resolve job before resuming');
        const report=await evaluateReview(tx,draft,{evidence:draft.evidence,media_probe:draft.media_probe,payload_hash:draft.payload_hash});
        if(!report.payloadMatches)report.holds.push('draft_changed_since_discovery');
        const batchDuplicates=duplicateDecision({...draft.payload,source:draft.evidence.source.namespace,sourceId:draft.evidence.source.id,
          googlePlaceId:draft.evidence.googlePlaceId},drafts.filter(other=>other.id!==draft.id).map(other=>({...other.payload,id:other.id,
          source:other.evidence.source.namespace,sourceId:other.evidence.source.id,googlePlaceId:other.evidence.googlePlaceId})));
        if(batchDuplicates.status!=='NEW_CANDIDATE')report.holds.push('unresolved_batch_duplicate');
        const holds=[...new Set(report.holds)];
        const state=holds.some(h=>/duplicate/.test(h))?'POSSIBLE_DUPLICATE':holds.some(h=>/license|image|source/.test(h))?'LICENSE_HOLD':holds.length?'COORDINATE_HOLD':'REVIEW_PENDING';
        // Passing deterministic checks only submits to a human reviewer.
        await audit(tx,draft.id,req.auth.user.id,'normalize_stage','DISCOVERED','STAGED',draft.evidence,draft.payload_hash);
        if(state==='REVIEW_PENDING') {
          await audit(tx,draft.id,req.auth.user.id,'verify_gates','STAGED','VERIFIED',draft.evidence,draft.payload_hash);
          await audit(tx,draft.id,req.auth.user.id,'request_review','VERIFIED','REVIEW_PENDING',draft.evidence,draft.payload_hash);
        } else await audit(tx,draft.id,req.auth.user.id,'quality_hold','STAGED',state,draft.evidence,draft.payload_hash,holds.join('|'));
        await tx`UPDATE place_reviews SET state=${state},revision=revision+1,updated_at=NOW() WHERE draft_id=${draft.id}`;
        summaries.push({ordinal:index,draftId:draft.id,state,holds,publicationAllowed:false});
      }
      const [updated]=await tx`UPDATE province_import_jobs SET next_index=${end},result=${tx.json(summaries)},
        state=${end===drafts.length?'REVIEW_PENDING':'RUNNING'},updated_at=NOW() WHERE id=${job.id} RETURNING *`;
      return {...updated,publicationAllowed:false};
    });res.status(result.code||200).json(result);
  }));
  app.get('/api/admin/candidate-queue',requireAdmin,wrap(async(req,res)=>{
    const province=typeof req.query.province==='string'?req.query.province:'';
    const page=Math.min(10000,Math.max(1,Math.trunc(Number(req.query.page)||1))),limit=30;
    const result=await getSql().begin('ISOLATION LEVEL REPEATABLE READ READ ONLY',async tx=>{
      const [count]=await tx`SELECT COUNT(*)::int AS total FROM place_drafts d JOIN place_reviews r ON r.draft_id=d.id WHERE (${province}='' OR d.payload->>'province'=${province})`;
      const rows=await tx`SELECT d.id,d.payload,d.status,d.target_place_id,EXTRACT(EPOCH FROM d.updated_at)::text AS version,r.state,r.revision,r.updated_at
        FROM place_drafts d JOIN place_reviews r ON r.draft_id=d.id WHERE (${province}='' OR d.payload->>'province'=${province})
        ORDER BY r.updated_at DESC,d.id LIMIT ${limit} OFFSET ${(page-1)*limit}`;
      return {candidates:rows,total:count.total,page,limit};
    });res.json(result);
  }));
  app.get('/api/admin/province-quality',requireAdmin,wrap(async(_req,res)=>{
    const data=await getSql().begin('ISOLATION LEVEL REPEATABLE READ READ ONLY',async tx=>{
      const existing=await tx`SELECT province,COUNT(*)::int AS total,COUNT(*) FILTER(WHERE image_url IS NULL OR BTRIM(image_url)='')::int AS missing_images,
        COUNT(*) FILTER(WHERE description IS NULL OR BTRIM(description)='')::int AS missing_details,MAX(verified_at) AS last_verified FROM places GROUP BY province`;
      const reviews=await tx`SELECT d.payload->>'province' AS province,COUNT(*)::int AS discovered,
        COUNT(*) FILTER(WHERE r.state='POSSIBLE_DUPLICATE')::int AS duplicates,COUNT(*) FILTER(WHERE r.state='LICENSE_HOLD')::int AS license_hold,
        COUNT(*) FILTER(WHERE r.state='COORDINATE_HOLD')::int AS coordinate_hold,COUNT(*) FILTER(WHERE r.state='APPROVED')::int AS approved,
        COUNT(*) FILTER(WHERE r.state='PUBLISHED')::int AS published,
        COUNT(*) FILTER(WHERE d.target_place_id IS NULL AND r.state IN ('VERIFIED','REVIEW_PENDING','APPROVED','PUBLISHED'))::int AS confirmed_new
        FROM place_drafts d JOIN place_reviews r ON r.draft_id=d.id GROUP BY d.payload->>'province'`;
      return {existing,reviews};
    });
    res.json({completenessClaim:null,automaticImport:false,provinces:Object.keys(PROVINCE_EN).sort().map(province=>({province,
      existing:data.existing.find(x=>x.province===province)||{total:0,missing_images:0,missing_details:0,last_verified:null},
      review:data.reviews.find(x=>x.province===province)||{discovered:0,duplicates:0,license_hold:0,coordinate_hold:0,approved:0,published:0,confirmed_new:0}}))});
  }));
}
module.exports={validateProvinceBatch,registerProvinceReviewPipeline};
