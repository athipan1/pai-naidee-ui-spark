'use strict';
// Startup backfills must never resurrect media after an Admin publication.
// Lock the same place row as the CMS publisher before reading publication state.
async function seedPlaceMedia(sql, photo, {userOnly=false}={}) {
  return sql.begin(async tx => {
    const [place] = await tx`SELECT id,image_url FROM places WHERE id=${photo.placeId} FOR UPDATE`;
    if (!place || place.image_url) return false;
    const published = await tx`SELECT id FROM place_drafts WHERE status='published'
      AND (target_place_id=${photo.placeId} OR 'cms:' || id::text=${photo.placeId}) LIMIT 1`;
    if (published.length) return false;
    if (userOnly) {
      const other = await tx`SELECT id FROM media WHERE place_id=${photo.placeId}
        AND id NOT LIKE ${`painaidee-provided:${photo.placeId}:%`} LIMIT 1`;
      if (other.length) return false;
    }
    await tx`INSERT INTO media(id,place_id,url,type,title,description,creator_name,license_name,license_url,source_page)
      VALUES(${photo.id},${photo.placeId},${photo.url},'image',${photo.title||''},${photo.description||''},
      ${photo.photographer||null},${photo.licenseName||null},${photo.licenseUrl||null},${photo.sourcePage||null})
      ON CONFLICT(id) DO NOTHING`;
    return true;
  });
}
module.exports={seedPlaceMedia};
