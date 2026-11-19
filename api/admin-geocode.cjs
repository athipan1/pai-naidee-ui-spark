'use strict';
const {isThaiProvince,addressMatchesProvince}=require('./thai-provinces.cjs');
const THAILAND_BOUNDS = { south: 5, north: 21, west: 97, east: 106 };

// Verified alternate names of the same landmark, not nearby places or districts.
const PLACE_ALIASES = [
  ['เขื่อนเชี่ยวหลาน', 'เขื่อนรัชชประภา', 'ทะเลสาบเชี่ยวหลาน', 'cheow lan lake', 'cheow lan dam', 'ratchaprapha dam', 'rajjaprabha dam'],
];

const normalized = text => String(text || '').normalize('NFKC').toLocaleLowerCase()
  .replace(/[\s\p{P}\p{S}]+/gu, '');

function searchNames(query) {
  const group = PLACE_ALIASES.find(names => names.some(name => normalized(name) === normalized(query)));
  if (!group) return [query];
  // Bounded fallback requests: requested name, Thai canonical alternate, English alternate.
  const alternateThai = group.find(name => /[ก-๙]/u.test(name) && normalized(name) !== normalized(query));
  const alternateEnglish = group.find(name => normalized(name) === 'ratchapraphadam' && normalized(name) !== normalized(query)) ||
    group.find(name => /[a-z]/i.test(name) && normalized(name) !== normalized(query));
  const preferred = [query, alternateThai, alternateEnglish].filter(Boolean);
  return [...new Map(preferred.map(name => [normalized(name), name])).values()].slice(0, 3);
}

function matchesPlaceName(query, names) {
  const requested = normalized(query);
  if (requested.length < 2) return false;
  const aliases = PLACE_ALIASES.find(group => group.some(name => normalized(name) === requested));
  return names.some(value => {
    const candidate = normalized(value);
    if (!candidate) return false;
    // Do not match short, generic name fragments to unrelated localities.
    if (candidate === requested || (requested.length >= 5 && candidate.includes(requested))) return true;
    return Boolean(aliases && aliases.some(alias => normalized(alias) === candidate));
  });
}

function isThailandCoordinate(lat, lng) {
  return Number.isFinite(lat) && Number.isFinite(lng) &&
    lat >= THAILAND_BOUNDS.south && lat <= THAILAND_BOUNDS.north &&
    lng >= THAILAND_BOUNDS.west && lng <= THAILAND_BOUNDS.east;
}

async function geocodeCandidates({ name, province, listPlaces, apiKey, request = fetch, resolveNames = async () => [], geoapifyOnly = false }) {
  const query = String(name || '').trim().slice(0, 120);
  const area = String(province || '').trim().slice(0, 100);
  if (query.length < 2) return { error: 'กรุณากรอกชื่อสถานที่อย่างน้อย 2 ตัวอักษร', candidates: [] };
  if (geoapifyOnly && !isThaiProvince(area)) return { error: 'กรุณาเลือกจังหวัดไทยที่ถูกต้อง', candidates: [] };

  const resolvedNames = geoapifyOnly ? [] : await resolveNames(query);
  // Automatic draft suggestions use exactly one TAT-verified name; no alias cascade.
  const names = geoapifyOnly ? [query] : [...new Map([...searchNames(query), ...resolvedNames].filter(Boolean)
    .map(name => [normalized(name), name])).values()].slice(0, 6);
  const candidates = [];
  const addCandidate = candidate => {
    if (!isThailandCoordinate(candidate.lat, candidate.lng) ||
        candidates.some(existing => Math.abs(existing.lat - candidate.lat) < 0.00005 && Math.abs(existing.lng - candidate.lng) < 0.00005)) return;
    candidates.push(candidate);
  };
  if (!geoapifyOnly) for (const lookupName of names) {
    const matches = await listPlaces({ search: lookupName, province: area, limit: 10 });
    for (const place of matches.attractions || []) {
      if (area && String(place.province || '').trim().toLocaleLowerCase() !== area.toLocaleLowerCase()) continue;
      if (!names.some(name => matchesPlaceName(name, [place.nameLocal, place.name]))) continue;
      addCandidate({ lat: Number(place.coordinates?.lat), lng: Number(place.coordinates?.lng),
        label: `${place.nameLocal || place.name} · ${place.province}`, source: 'PaiNaiDee' });
    }
    if (candidates.length >= 5) break;
  }

  // External geocoding is opt-in, paid-provider based, and server-side only.
  // Never call the public Nominatim service from the CMS.
  if (apiKey) {
    // Try aliases only when the primary spelling did not yield a verified result.
    for (const lookupName of names) {
      const params = new URLSearchParams({ text: [lookupName, area, 'Thailand'].filter(Boolean).join(', '), filter: 'countrycode:th',
        lang: 'th', format: 'json', limit: '5', apiKey });
      try {
        const response = await request(`https://api.geoapify.com/v1/geocode/search?${params}`, {
          signal: AbortSignal.timeout(7000), headers: { Accept: 'application/json' },
        });
        if (response.ok) {
          const data = await response.json();
          for (const item of data.results || []) {
            const lat = Number(item.lat);
            const lng = Number(item.lon);
            if (!isThailandCoordinate(lat, lng) || item.country_code?.toLowerCase() !== 'th') continue;
            // A municipal centroid is not a match for a landmark, even in the correct province.
            if (!names.some(name => matchesPlaceName(name, [item.name, item.address_line1, item.formatted]))) continue;
            if (geoapifyOnly) {
              // Never suggest a neighbouring province or an administrative centroid.
              if (!item.state || !addressMatchesProvince(String(item.state),area)) continue;
              if (['country','state','county','city','postcode','district','suburb'].includes(item.result_type)) continue;
              if (!matchesPlaceName(lookupName,[item.name,item.address_line1])) continue;
              if (item.rank?.confidence != null && Number(item.rank.confidence) < 0.7) continue;
            }
            addCandidate({ lat, lng, label: String(item.formatted || item.name || lookupName).slice(0, 250),
              source: 'Geoapify', ...(Number.isFinite(Number(item.rank?.confidence)) && item.rank?.confidence != null
                ? {confidence:Number(item.rank.confidence)} : {}) });
          }
        }
      } catch {
        // Verified database candidates are still usable during provider outages.
      }
      if (candidates.length) break;
    }
  }
  return { candidates: candidates.slice(0, 10), providerConfigured: Boolean(apiKey) };
}


// Name + coordinate fallback for an Admin-created draft only. The lookup key
// may originate in an ephemeral Google preview; its text is never persisted.
// Source names and coordinates are exclusively from independently returned
// Geoapify records (primarily OSM), with attribution retained on the draft.
async function resolveGeoapifyDraft({province,candidateName,apiKey,request=fetch}){
  if(!apiKey)return {status:'geoapify_unavailable'};
  if(!isThaiProvince(province)||typeof candidateName!=='string'||
     candidateName.trim().length<2||candidateName.length>160)
    return {status:'geoapify_invalid_lookup'};
  const query=candidateName.trim();
  const isPoi=item=>{
    if(!item||typeof item!=='object')return false;
    const lat=Number(item.lat),lng=Number(item.lon);
    if(!isThailandCoordinate(lat,lng)||String(item.country_code||'').toLowerCase()!=='th')return false;
    if(!item.state||!addressMatchesProvince(String(item.state),province))return false;
    if(['country','state','county','city','postcode','district','suburb','street'].includes(item.result_type))return false;
    if(!Number.isFinite(Number(item.rank?.confidence))||Number(item.rank?.confidence)<0.8)return false;
    return typeof item.name==='string'&&item.name.trim().length>=2;
  };
  // Bounded to two requests, parallel, without guessing either translation.
  const languages=['th','en'];
  const responses=await Promise.all(languages.map(async lang=>{
    const params=new URLSearchParams({
      text:[query,province,'Thailand'].join(', '),
      filter:'countrycode:th',format:'json',lang,limit:'5',apiKey
    });
    try{
      const response=await request('https://api.geoapify.com/v1/geocode/search?'+params,{
        signal:AbortSignal.timeout(6000),headers:{Accept:'application/json'}
      });
      if(!response.ok)return {lang,results:[]};
      const data=await response.json();
      return {lang,results:Array.isArray(data?.results)?data.results.filter(isPoi):[]};
    }catch{
      return {lang,results:[]};
    }
  }));
  const entries=responses.flatMap(r=>r.results.map(item=>({lang:r.lang,item})));
  // The Google preview is used to identify the matching independent feature,
  // never as a fallback value for a draft field.
  const anchors=entries.filter(({item})=>matchesPlaceName(query,[item.name]));
  if(!anchors.length)return {status:'geoapify_no_match'};
  const sameFeature=(a,b)=>{
    const idA=String(a.place_id||''),idB=String(b.place_id||'');
    if(idA&&idB&&idA===idB)return true;
    return Math.abs(Number(a.lat)-Number(b.lat))<=0.00015 &&
      Math.abs(Number(a.lon)-Number(b.lon))<=0.00015;
  };
  const unique=[];
  for(const entry of anchors){
    if(!unique.some(x=>sameFeature(x.item,entry.item)))unique.push(entry);
  }
  // Multiple equally matching attractions must be chosen manually.
  if(unique.length!==1)return {status:'geoapify_ambiguous'};
  const anchor=unique[0].item;
  const related=entries.filter(({item})=>sameFeature(anchor,item));
  const names=related.flatMap(({item,lang})=>{
    const result=[{value:item.name,lang}];
    const international=item.name_international;
    if(international&&typeof international==='object'){
      for(const language of ['th','en'])result.push({value:international[language],lang:language});
    }
    return result;
  });
  const clean=value=>typeof value==='string'
    ? value.replace(/<[^>]*>/g,' ').replace(/[\u0000-\u001f\u007f<>]/g,' ').replace(/\s+/g,' ').trim().slice(0,160):'';
  const thai=names.map(n=>({...n,value:clean(n.value)}))
    .find(n=>n.lang==='th'&&/[\u0e01-\u0e5b]/.test(n.value))?.value||'';
  const english=names.map(n=>({...n,value:clean(n.value)}))
    .find(n=>n.lang==='en'&&/[a-z]/i.test(n.value)&&!/[\u0e01-\u0e5b]/.test(n.value))?.value||'';
  if(!thai&&!english)return {status:'geoapify_no_match'};
  const lat=Number(anchor.lat),lng=Number(anchor.lon);
  const rawId=String(anchor.place_id||'').replace(/[^A-Za-z0-9_-]/g,'').slice(0,110);
  const sourceId='geoapify-'+(rawId||lat.toFixed(5)+'-'+lng.toFixed(5));
  return {
    status:'geoapify_matched',
    source:{id:sourceId,name:'Geoapify / OpenStreetMap',
      url:'https://www.geoapify.com/',license:'ODbL 1.0',
      attribution:'© OpenStreetMap contributors'},
    fields:{name:english||thai,nameLocal:thai},
    englishNameFound:Boolean(english),
    // Only a suggested marker; NEVER store these coordinates in the draft
    // until Admin explicitly confirms a map pin and saves the draft.
    suggestion:{lat,lng,source:'Geoapify',
      label:clean(anchor.formatted)||thai||english,
      confidence:Number(anchor.rank.confidence)}
  };
}

module.exports = { geocodeCandidates, resolveGeoapifyDraft, isThailandCoordinate, matchesPlaceName, searchNames };
