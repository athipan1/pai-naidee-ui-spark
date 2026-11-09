'use strict';
const {audit}=require('./place-review-workflow.cjs');
const {payloadHash}=require('./place-review-evidence.cjs');

// An administrator's publication decision is not an independent quality review.
// Preserve historical evidence, but never present it as verification of this edit.
async function finishDirectPublication(tx,draft,placeId,actorId) {
  const [review]=await tx`SELECT state FROM place_reviews WHERE draft_id=${draft.id} FOR UPDATE`;
  const publication={publicationMode:'admin_direct',qualityReviewPerformed:false};
  if(draft.payload.googlePlaceId) {
    const id=draft.payload.googlePlaceId;
    await tx`INSERT INTO place_external_ids(namespace,external_id,place_id,reviewed_by)
      VALUES('google_places',${id},${placeId},${actorId}) ON CONFLICT(namespace,external_id) DO NOTHING`;
    const [owner]=await tx`SELECT place_id FROM place_external_ids WHERE namespace='google_places' AND external_id=${id}`;
    if(owner?.place_id!==placeId)throw Object.assign(Error('Identity already claimed'),{code:'PUBLICATION_DUPLICATE'});
  }
  await tx`UPDATE places SET verified_at=NULL,detail_text=${draft.payload.description||null},detail_source_url=NULL WHERE id=${placeId}`;
  await tx`UPDATE place_publication_details SET evidence=evidence || ${tx.json(publication)} WHERE place_id=${placeId}`;
  await tx`UPDATE place_reviews SET state='PUBLISHED',revision=revision+1,updated_at=NOW() WHERE draft_id=${draft.id}`;
  await audit(tx,draft.id,actorId,'direct_publish',review?.state||'DISCOVERED','PUBLISHED',publication,payloadHash(draft.payload),
    'Published directly by administrator; independent evidence review was not performed.');
}
module.exports={finishDirectPublication};
