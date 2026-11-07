'use strict';
const {reviewCandidate,reviewCsv}=require('./place-candidate-quality.cjs');
async function reviewDraft(getSql,draftId) {
  // One consistent read-only snapshot; aliases and place rows cannot come from
  // different catalogue versions. Bound memory, abort rather than truncate.
  return getSql().begin('ISOLATION LEVEL REPEATABLE READ READ ONLY',async tx=>{
    await tx`SET LOCAL statement_timeout = '5000ms'`;
    const [draft]=await tx`SELECT id,payload,target_place_id FROM place_drafts WHERE id=${draftId}`;
    if(!draft) return null;
    const rows=await tx`SELECT p.id,p.name,p.name_local,p.province,p.lat,p.lng,p.source_name,
      COALESCE((SELECT json_agg(a.alias_name) FROM place_aliases a WHERE a.place_id=p.id AND a.status='approved'),'[]'::json) AS aliases
      FROM places p ORDER BY p.id LIMIT 20001`;
    if(rows.length>20000) throw Error('Catalogue exceeds synchronous review cap');
    const candidate={...draft.payload,existingPlaceId:draft.target_place_id};
    const result=reviewCandidate(candidate,rows);
    return {candidateId:draft.id,name:draft.payload.nameLocal || draft.payload.name,province:draft.payload.province,
      ...result,action:result.duplicate.action,matchedPlaceIds:result.duplicate.matches.map(m=>m.placeId),
      baselineCount:rows.length,mode:'read_only',reviewedAt:new Date().toISOString()};
  });
}
function registerQualityReview(app,{requireAdmin,getSql}) {
  app.get('/api/admin/places/:draftId/quality-review',requireAdmin,async(req,res)=>{
    res.set('Cache-Control','no-store');
    try {
      const result=await reviewDraft(getSql,req.params.draftId);
      if(!result) return res.status(404).json({error:'Draft not found.'});
      if(req.query.format==='csv') return res.type('text/csv').attachment('candidate-review.csv').send(reviewCsv([result]));
      res.json(result);
    } catch {res.status(503).json({error:'Quality review unavailable; publication is not approved.'});}
  });
}
module.exports={reviewDraft,registerQualityReview};
