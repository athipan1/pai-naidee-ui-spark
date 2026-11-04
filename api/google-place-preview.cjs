'use strict';

// Live display only. Never store Google payloads, photo resource names, or URLs.
// Default-off independent pilot protects existing trip-planner quotas.
const { reserveGoogleDailyQuota } = require('./google-daily-usage.cjs');
const SEARCH_URL = 'https://places.googleapis.com/v1/places:searchText';
const FIELDS = 'places.id,places.displayName,places.location,places.formattedAddress,places.googleMapsUri,places.rating,places.userRatingCount,places.regularOpeningHours,places.photos';
const MAX_DISTANCE_KM = 1.5;

function enabled() {
  const expiry = Date.parse(process.env.GOOGLE_PLACE_DETAIL_PILOT_EXPIRES_AT || '');
  return process.env.GOOGLE_PLACE_DETAIL_ENABLED === 'true' &&
    Boolean(process.env.GOOGLE_PLACES_API_KEY) &&
    Number.isFinite(expiry) && Date.now() < expiry;
}
function kmBetween(a,b) {
  const radians = n => n * Math.PI / 180;
  const dLat = radians(b.lat-a.lat), dLng = radians(b.lng-a.lng);
  const q = Math.sin(dLat/2)**2 + Math.cos(radians(a.lat))*Math.cos(radians(b.lat))*Math.sin(dLng/2)**2;
  return 6371*2*Math.atan2(Math.sqrt(q),Math.sqrt(1-q));
}
function safeMapsUrl(value) {
  try {
    const u = new URL(value);
    return u.protocol === 'https:' && (u.hostname === 'google.com' || u.hostname.endsWith('.google.com') || u.hostname === 'maps.app.goo.gl') ? u.href : null;
  } catch { return null; }
}
function chooseMatch(places, place) {
  const localName = String(place.nameLocal || place.name || '').toLocaleLowerCase().replace(/\s+/g,'');
  const local = place.coordinates;
  if (!localName || !Number.isFinite(local?.lat) || !Number.isFinite(local?.lng)) return null;
  return (Array.isArray(places)?places:[]).find(candidate => {
    const name = String(candidate.displayName?.text || '').toLocaleLowerCase().replace(/\s+/g,'');
    const point = {lat:Number(candidate.location?.latitude),lng:Number(candidate.location?.longitude)};
    return name.length >= 4 && (name.includes(localName) || localName.includes(name)) &&
      Number.isFinite(point.lat) && Number.isFinite(point.lng) &&
      kmBetween(local,point) <= MAX_DISTANCE_KM;
  }) || null;
}
function photoAttributions(photo) {
  return (Array.isArray(photo?.authorAttributions)?photo.authorAttributions:[]).slice(0,3).map(a=>({
    name:String(a.displayName||'').slice(0,150),
    uri:safeMapsUrl(a.uri) || (()=>{
      try {const u=new URL(a.uri);return u.protocol==='https:'?u.href:null;}catch{return null;}
    })(),
    photoUri:(()=>{try{const u=new URL(a.photoUri);return u.protocol==='https:'?u.href:null;}catch{return null;}})(),
  })).filter(a=>a.name);
}
async function livePlacePreview(place, getSql, fetchImpl=fetch, reserve=reserveGoogleDailyQuota) {
  if (!enabled() || place?.province !== 'ชลบุรี') return {status:'disabled'};
  if (!await reserve('places_detail',getSql)) return {status:'quota_exhausted'};
  const query = String(place.nameLocal || place.name || '').trim().slice(0,100) + ' ชลบุรี ประเทศไทย';
  try {
    const response = await fetchImpl(SEARCH_URL,{
      method:'POST',signal:AbortSignal.timeout(7000),
      headers:{'Content-Type':'application/json','X-Goog-Api-Key':process.env.GOOGLE_PLACES_API_KEY,'X-Goog-FieldMask':FIELDS},
      body:JSON.stringify({textQuery:query,languageCode:'th',regionCode:'TH',pageSize:5,
        locationBias:{circle:{center:{latitude:place.coordinates.lat,longitude:place.coordinates.lng},radius:1500}}}),
    });
    if(!response.ok) return {status:'unavailable'};
    const data=await response.json();
    const match=chooseMatch(data?.places,place);
    if(!match) return {status:'no_match'};
    let photoUrl=null,attributions=[];
    const photo=match.photos?.[0];
    const photoName=String(photo?.name||'');
    if(photoName.startsWith('places/'+match.id+'/photos/') && /^places\/[A-Za-z0-9_-]+\/photos\/[A-Za-z0-9_-]+$/.test(photoName)) {
      attributions=photoAttributions(photo);
      if(await reserve('places_photo',getSql)) {
        try {
          const url='https://places.googleapis.com/v1/'+photoName+'/media?maxWidthPx=960&skipHttpRedirect=true';
          const r=await fetchImpl(url,{signal:AbortSignal.timeout(7000),headers:{'X-Goog-Api-Key':process.env.GOOGLE_PLACES_API_KEY}});
          if(r.ok) {
            const media=await r.json();
            const u=new URL(media?.photoUri);
            if(u.protocol==='https:' && (u.hostname==='googleusercontent.com'||u.hostname.endsWith('.googleusercontent.com'))) photoUrl=u.href;
          }
        } catch {}
      }
    }
    return {status:'ok',source:'google_places',name:match.displayName?.text||'',address:match.formattedAddress||'',
      rating:Number.isFinite(match.rating)?match.rating:null,
      reviewCount:Number.isInteger(match.userRatingCount)?match.userRatingCount:null,
      openingHours:(match.regularOpeningHours?.weekdayDescriptions||[]).slice(0,7),
      googleMapsUrl:safeMapsUrl(match.googleMapsUri),photoUrl,attributions};
  } catch {return {status:'unavailable'};}
}
module.exports={enabled,chooseMatch,livePlacePreview,kmBetween,photoAttributions};
