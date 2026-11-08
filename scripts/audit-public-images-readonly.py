import json,urllib.request,urllib.parse,concurrent.futures,datetime,hashlib,io,os
from PIL import Image
base='https://painaidee-api-production.up.railway.app'
out=os.environ.get('IMAGE_AUDIT_OUTPUT','reports/global-image-consistency')
os.makedirs(out,exist_ok=True)
def read(url):
 req=urllib.request.Request(url,headers={'Accept':'application/json','User-Agent':'PaiNaiDee-ReadOnly-ImageAudit/1.0'})
 with urllib.request.urlopen(req,timeout=30) as f:return json.load(f)
first=read(base+'/api/places?limit=50&page=1');places=list(first['attractions'])
for page in range(2,(first['total']+49)//50+1):places+=read(base+f'/api/places?limit=50&page={page}')['attractions']
assert len(places)==first['total']==len({p['id'] for p in places})
snapshot_keys={'id','name','nameLocal','province','source','image','images','mediaCredits','coordinates'}
json.dump([{k:v for k,v in p.items() if k in snapshot_keys}for p in places],open(out+'/public-api-before.json','w'),ensure_ascii=False,indent=2)
urls=sorted({u for p in places for u in [p.get('image'),*p.get('images',[])] if u})
allowed={'commons.wikimedia.org','upload.wikimedia.org','thumb.wikimedia.org','painaidee-api-production.up.railway.app','pai-naidee-ui-spark.vercel.app'}
class Guard(urllib.request.HTTPRedirectHandler):
 def redirect_request(self,req,fp,code,msg,headers,newurl):
  if urllib.parse.urlsplit(newurl).hostname not in allowed:raise ValueError('redirect_host_needs_review')
  return super().redirect_request(req,fp,code,msg,headers,newurl)
def probe(url):
 try:
  u=urllib.parse.urlsplit(url)
  if u.scheme!='https' or u.hostname not in allowed or u.username or u.password:return {'url':url,'status':'unverified_host'}
  req=urllib.request.Request(url,headers={'User-Agent':'PaiNaiDee-ReadOnly-ImageAudit/1.0','Accept':'image/*'})
  with urllib.request.build_opener(Guard()).open(req,timeout=18) as f:
   mime=f.headers.get('Content-Type','');data=f.read(5*1024*1024+1)
   if len(data)>5*1024*1024:return {'url':url,'status':'unverified_size'}
   im=Image.open(io.BytesIO(data));im.verify()
   return {'url':url,'status':'ok','http':f.status,'mime':mime,'sha256':hashlib.sha256(data).hexdigest(),'bytes':len(data)}
 except urllib.error.HTTPError as e:return {'url':url,'status':'http_error','http':e.code}
 except Exception as e:return {'url':url,'status':'unverified','reason':type(e).__name__}
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:probes=list(pool.map(probe,urls))
json.dump(probes,open(out+'/url-probes-before.json','w'),ensure_ascii=False,indent=2)
by={p['url']:p for p in probes};rows=[]
for p in places:
 issues=[];image=p.get('image');images=p.get('images',[]);credits={c['url']:c for c in p.get('mediaCredits',[])}
 if not image:issues.append('primary_missing')
 if image and (not images or image!=images[0]):issues.append('api_primary_gallery_mismatch')
 if len(images)!=len(set(images)):issues.append('duplicate_gallery_url')
 if image and image not in credits:issues.append('primary_credit_missing')
 if any(u not in credits for u in images):issues.append('gallery_credit_missing')
 for u in set(images+([image] if image else [])):
  if by[u]['status']!='ok':issues.append('url_'+by[u]['status'])
 rows.append({'id':p['id'],'name':p.get('nameLocal',p['name']),'province':p['province'],'source':p.get('source'),'image':image,'issues':sorted(set(issues))})
sample=[p for p in places if p['id']=='curated-khao-khitchakut-national-park']
for p in places:
 if len(sample)>=10:break
 if p['province'] not in {s['province'] for s in sample}:sample.append(p)
details=[]
for p in sample:
 try:
  d=read(base+'/api/places/'+urllib.parse.quote(p['id']))
  details.append({'id':p['id'],'province':p['province'],'listImage':p.get('image'),'detailFirst':(d.get('images')or[None])[0],'match':p.get('image')==(d.get('images')or[None])[0],'detail':{k:v for k,v in d.items() if k in snapshot_keys}})
 except Exception as e:details.append({'id':p['id'],'error':type(e).__name__})
json.dump(details,open(out+'/detail-samples-before.json','w'),ensure_ascii=False,indent=2)
summary={'checkedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'scope':'Public API only; SQL/raw image_url and full UI consistency NOT established','total':len(places),'apiPrimaryEqualsFirstGallery':sum(bool(p.get('image')) and p['image']==(p.get('images')or[None])[0] for p in places),'placesWithConfirmedHttpError':sum('url_http_error' in r['issues'] for r in rows),'placesNeedingReview':sum(bool(r['issues']) for r in rows),'noIssueInPublicApiProbe':sum(not r['issues'] for r in rows),'distinctUrls':len(urls),'urlStatuses':{s:sum(p['status']==s for p in probes)for s in sorted({p['status']for p in probes})},'sqlAudit':'not_run','globalStatus':'NOT_PASS'}
json.dump(rows,open(out+'/place-issues-before.json','w'),ensure_ascii=False,indent=2)
json.dump(summary,open(out+'/summary-before.json','w'),ensure_ascii=False,indent=2)
print(json.dumps(summary,ensure_ascii=False))
