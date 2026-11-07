'use strict';
const {randomUUID}=require('node:crypto');
const {reviewCandidate,independentUrl}=require('./place-candidate-quality.cjs');
const {cleanEvidence,evidenceHolds,payloadHash}=require('./place-review-evidence.cjs');
const {probeMedia}=require('./place-media-quality.cjs');
const {createRateLimiter}=require('./security.cjs');
const STATES=['DISCOVERED','STAGED','VERIFIED','REVIEW_PENDING','APPROVED','PUBLISHED','POSSIBLE_DUPLICATE','LICENSE_HOLD','COORDINATE_HOLD','REJECTED'];
async function evaluateReview(tx,draft,review) {
  const evidence=review.evidence;
  const rows=await tx`SELECT p.id,p.name,p.name_local,p.province,p.lat,p.lng,p.source_name,
    COALESCE((SELECT json_agg(a.alias_name) FROM place_aliases a WHERE a.place_id=p.id AND a.status='approved'),'[]'::json) AS aliases,
    COALESCE((SELECT json_agg(json_build_object('source',e.namespace,'id',e.external_id)) FROM place_external_ids e WHERE e.place_id=p.id),'[]'::json) AS external_ids
    FROM places p ORDER BY p.id LIMIT 20001`;
  if(rows.length>20000)throw Error('Catalogue review cap exceeded');
  const [boundary]=await tx`SELECT geometry FROM province_review_boundaries WHERE province=${draft.payload.province}`;
  const candidate={...draft.payload,existingPlaceId:draft.target_place_id,
    source:evidence.source.namespace,sourceId:evidence.source.id,googlePlaceId:evidence.googlePlaceId,
    provenance:{sourceId:evidence.source.id,sourceUrl:evidence.source.url,license:evidence.source.licenseName,
      coordinateSourceUrl:evidence.coordinate.sourceUrl,coordinateLicense:evidence.coordinate.licenseName},
    access:{kind:evidence.coordinate.kind,sourceUrl:evidence.coordinate.publicAccessUrl,restricted:evidence.coordinate.restricted,
      publicNavigationPoint:evidence.coordinate.publicNavigationPoint,authorityUrl:evidence.coordinate.authorityUrl}};
  const result=reviewCandidate(candidate,rows,{boundary:boundary?.geometry,province:draft.payload.province});
  const holds=[...result.holds,...evidenceHolds(draft.payload,evidence,review.media_probe)];
  const unresolved=result.duplicate.matches.filter(m=>m.placeId!==draft.target_place_id &&
    (m.confidence==='identifier_match'||!evidence.duplicateResolutions.some(r=>r.placeId===m.placeId&&r.note.length>=10&&independentUrl(r.sourceUrl))));
  if(unresolved.length)holds.push('unresolved_duplicate');
  if(review.media_probe?.sha256) {
    const duplicates=await tx`SELECT place_id FROM place_publication_details
      WHERE evidence->'mediaProbe'->>'sha256'=${review.media_probe.sha256} AND place_id IS DISTINCT FROM ${draft.target_place_id} LIMIT 1`;
    if(duplicates.length)holds.push('duplicate_image');
  }
  return {...result,holds:[...new Set(holds)],unresolvedDuplicates:unresolved,baselineCount:rows.length,
    payloadMatches:review.payload_hash===payloadHash(draft.payload)};
}
async function audit(tx,draftId,actorId,action,from,to,evidence,hash,reason='') {
  await tx`INSERT INTO place_review_events(id,draft_id,actor_id,action,from_state,to_state,evidence,payload_hash,reason)
    VALUES(${randomUUID()},${draftId},${actorId},${action},${from},${to},${tx.json(evidence)},${hash},${reason})`;
}
function publicationGateDecision(review,report) {
  if(!review||!review.evidence||['REJECTED','PUBLISHED'].includes(review.state))
    return {ok:false,error:'Save valid publication evidence before publishing.',holds:['review_evidence_required']};
  if(!report?.payloadMatches||report.holds?.length)
    return {ok:false,error:'Publication quality gates failed or evidence is stale.',holds:report?.payloadMatches?(report.holds||[]):['draft_changed_since_review']};
  return {ok:true};
}
async function assertApprovedPublication(tx,draft) {
  const [review]=await tx`SELECT * FROM place_reviews WHERE draft_id=${draft.id} FOR UPDATE`;
  // Admin direct publishing removes the human approval step, not the evidence gates.
  const preflight=publicationGateDecision(review);
  if(!preflight.ok)return preflight;
  const report=await evaluateReview(tx,draft,review);
  const decision=publicationGateDecision(review,report);
  if(!decision.ok)return decision;
  if(review.state!=='APPROVED') {
    await tx`UPDATE place_reviews SET state='APPROVED',reviewed_by=${draft._publishingActorId},reviewed_at=NOW(),revision=revision+1,updated_at=NOW() WHERE draft_id=${draft.id}`;
    await audit(tx,draft.id,draft._publishingActorId,'auto_approve_on_publish',review.state,'APPROVED',review.evidence,review.payload_hash,'Admin direct publish; all quality gates passed');
  }
  return {ok:true,review,evidence:review.evidence,report};
}
async function finishPublication(tx,draft,placeId,actorId,approval) {
  const e=approval.evidence,ids=[{namespace:e.source.namespace,id:e.source.id},...(e.googlePlaceId?[{namespace:'google_places',id:e.googlePlaceId}]:[])];
  for(const identity of ids) {
    const [existing]=await tx`SELECT place_id FROM place_external_ids WHERE namespace=${identity.namespace} AND external_id=${identity.id}`;
    if(existing&&existing.place_id!==placeId)throw Object.assign(Error('Identity already claimed'),{code:'PUBLICATION_DUPLICATE'});
    await tx`INSERT INTO place_external_ids(namespace,external_id,place_id,reviewed_by)
      VALUES(${identity.namespace},${identity.id},${placeId},${actorId}) ON CONFLICT(namespace,external_id) DO NOTHING`;
    const [owner]=await tx`SELECT place_id FROM place_external_ids WHERE namespace=${identity.namespace} AND external_id=${identity.id}`;
    if(owner?.place_id!==placeId)throw Object.assign(Error('Identity claim raced'),{code:'PUBLICATION_DUPLICATE'});
  }
  await tx`UPDATE places SET source_name=${e.source.name},source_url=${e.source.url},verified_at=NOW(),
    detail_text=${draft.payload.description||null},detail_source_url=${e.detailSourceUrl||null} WHERE id=${placeId}`;
  if(draft.payload.imageUrl) await tx`UPDATE media SET creator_name=${e.media.photographer},license_name=${e.media.licenseName},
    license_url=${e.media.licenseUrl||e.media.permissionUrl},source_page=${e.media.sourcePage}
    WHERE place_id=${placeId} AND url=${draft.payload.imageUrl} AND type='image'`;
  await tx`INSERT INTO place_publication_details(place_id,evidence,reviewed_by)
    VALUES(${placeId},${tx.json({...e,mediaProbe:approval.review.media_probe,navigation:{lat:Number(draft.payload.lat),lng:Number(draft.payload.lng),kind:e.coordinate.kind,sourceUrl:e.coordinate.sourceUrl}})},${actorId})
    ON CONFLICT(place_id) DO UPDATE SET evidence=EXCLUDED.evidence,reviewed_by=EXCLUDED.reviewed_by,verified_at=NOW()`;
  await tx`UPDATE place_reviews SET state='PUBLISHED',revision=revision+1,updated_at=NOW() WHERE draft_id=${draft.id}`;
  await audit(tx,draft.id,actorId,'publish','APPROVED','PUBLISHED',e,approval.review.payload_hash);
}
function holdState(holds) {
  return holds.includes('unresolved_duplicate')?'POSSIBLE_DUPLICATE':holds.some(h=>/license|image|source|credit/.test(h))?'LICENSE_HOLD':'COORDINATE_HOLD';
}
function registerPlaceReviewWorkflow(app,{getSql,requireAdmin,mediaStorage,probe=probeMedia}) {
  const wrap=handler=>async(req,res)=>{try{await handler(req,res);}catch{res.status(503).json({error:'Review workflow unavailable. Approved review schema is required; publishing remains blocked.'});}};
  const load=async(tx,id)=>{
    await tx`SET LOCAL statement_timeout = '5000ms'`;
    const [draft]=await tx`SELECT *,EXTRACT(EPOCH FROM updated_at)::text AS version FROM place_drafts WHERE id=${id} FOR UPDATE`;
    if(!draft)return {code:404,error:'Draft not found.'};
    if(draft.status==='published')return {code:409,error:'Published draft is immutable. Create an edit draft.'};
    const [review]=await tx`SELECT * FROM place_reviews WHERE draft_id=${id} FOR UPDATE`;
    return {draft,review};
  };
  app.get('/api/admin/places/:draftId/review',requireAdmin,wrap(async(req,res)=>{
    const result=await getSql().begin('ISOLATION LEVEL REPEATABLE READ READ ONLY',async tx=>{
      await tx`SET LOCAL statement_timeout = '5000ms'`;
      const [draft]=await tx`SELECT * FROM place_drafts WHERE id=${req.params.draftId}`;
      if(!draft)return {code:404,error:'Draft not found.'};
      const [review]=await tx`SELECT * FROM place_reviews WHERE draft_id=${draft.id}`;
      const history=await tx`SELECT actor_id,action,from_state,to_state,reason,created_at FROM place_review_events WHERE draft_id=${draft.id} ORDER BY created_at DESC LIMIT 100`;
      return {state:review?.state||'DISCOVERED',revision:review?.revision||0,evidence:review?.evidence||null,history,
        report:review?await evaluateReview(tx,draft,review):null,preview:draft.payload};
    });res.status(result.code||200).json(result);
  }));
  app.put('/api/admin/places/:draftId/evidence',requireAdmin,wrap(async(req,res)=>{
    const parsed=cleanEvidence(req.body?.evidence);
    if(parsed.error)return res.status(400).json({error:parsed.error});
    const result=await getSql().begin(async tx=>{
      const data=await load(tx,req.params.draftId);if(data.error)return data;
      const {draft,review}=data;
      if(req.body.version!==draft.version||req.body.revision!==(review?.revision||0))return {code:409,error:'Draft or review changed. Reload before saving.'};
      const hash=payloadHash(draft.payload);
      const [saved]=await tx`INSERT INTO place_reviews(draft_id,evidence,payload_hash)
        VALUES(${draft.id},${tx.json(parsed.value)},${hash}) ON CONFLICT(draft_id) DO UPDATE SET
          state='STAGED',evidence=EXCLUDED.evidence,payload_hash=EXCLUDED.payload_hash,media_probe=NULL,reviewed_by=NULL,reviewed_at=NULL,
          revision=place_reviews.revision+1,updated_at=NOW() RETURNING state,revision`;
      await audit(tx,draft.id,req.auth.user.id,'stage_evidence',review?.state||'DISCOVERED','STAGED',parsed.value,hash);
      return saved;
    });res.status(result.code||200).json(result);
  }));
  app.post('/api/admin/places/:draftId/probe-media',requireAdmin,createRateLimiter({windowMs:60000,max:6,keyPrefix:'review-image'}),wrap(async(req,res)=>{
    const sql=getSql();
    const [snapshot]=await sql`SELECT r.*,d.payload FROM place_reviews r JOIN place_drafts d ON d.id=r.draft_id WHERE r.draft_id=${req.params.draftId} AND d.status='draft' AND r.state='STAGED'`;
    if(!snapshot||snapshot.revision!==req.body?.revision)return res.status(409).json({error:'Reload the review before probing media.'});
    const result=await probe(snapshot.evidence.media,{storage:mediaStorage});
    const updated=await sql.begin(async tx=>{
      const rows=await tx`UPDATE place_reviews SET media_probe=${tx.json(result)},revision=revision+1,updated_at=NOW()
        WHERE draft_id=${snapshot.draft_id} AND state='STAGED' AND revision=${snapshot.revision} AND payload_hash=${payloadHash(snapshot.payload)} RETURNING revision`;
      if(rows.length)await audit(tx,snapshot.draft_id,req.auth.user.id,'probe_media','STAGED','STAGED',snapshot.evidence,snapshot.payload_hash,result.ok?'Image probe passed':'Image probe held');
      return rows;
    });
    if(!updated.length)return res.status(409).json({error:'Review changed during media probe.'});
    res.json({...result,revision:updated[0].revision});
  }));
  app.post('/api/admin/places/:draftId/review-transition',requireAdmin,wrap(async(req,res)=>{
    const {action,revision,reason=''}=req.body||{};
    if(!['verify','request_review','approve','reject','request_changes'].includes(action)||!Number.isInteger(revision)||typeof reason!=='string'||reason.length>1000)
      return res.status(400).json({error:'Invalid review action.'});
    const result=await getSql().begin(async tx=>{
      const data=await load(tx,req.params.draftId);if(data.error)return data;
      const {draft,review}=data;
      if(!review||review.revision!==revision||review.payload_hash!==payloadHash(draft.payload))return {code:409,error:'Review changed or evidence is stale. Save evidence again.'};
      const transitions={verify:{STAGED:'VERIFIED'},request_review:{VERIFIED:'REVIEW_PENDING'},approve:{REVIEW_PENDING:'APPROVED'},
        reject:Object.fromEntries(STATES.filter(s=>!['PUBLISHED','REJECTED'].includes(s)).map(s=>[s,'REJECTED'])),
        request_changes:{REVIEW_PENDING:'STAGED',APPROVED:'STAGED',POSSIBLE_DUPLICATE:'STAGED',LICENSE_HOLD:'STAGED',COORDINATE_HOLD:'STAGED'}};
      let target=transitions[action][review.state];
      if(!target)return {code:409,error:'Review transition is not allowed.'};
      if(['reject','request_changes'].includes(action)&&reason.trim().length<5)return {code:400,error:'A review reason is required.'};
      const report=await evaluateReview(tx,draft,review);
      if(['verify','request_review','approve'].includes(action)&&report.holds.length)target=holdState(report.holds);
      const [saved]=await tx`UPDATE place_reviews SET state=${target},reviewed_by=${req.auth.user.id},reviewed_at=NOW(),
        revision=revision+1,updated_at=NOW() WHERE draft_id=${draft.id} RETURNING state,revision`;
      await audit(tx,draft.id,req.auth.user.id,action,review.state,target,review.evidence,review.payload_hash,reason.trim());
      return {...saved,report};
    });res.status(result.code||200).json(result);
  }));
}
module.exports={STATES,evaluateReview,publicationGateDecision,assertApprovedPublication,finishPublication,registerPlaceReviewWorkflow,audit};
