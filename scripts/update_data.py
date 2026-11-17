"""Validated, privacy-minimized SBIR.gov collection. Python standard library only."""
import collections,csv,datetime,email.utils,gzip,hashlib,json,math,os,re,shutil,tempfile,time,urllib.error,urllib.request
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'sbir-data.json'
PUBLISH=ROOT/'public'
SOURCE='https://data.www.sbir.gov/mod_awarddatapublic/award_data.csv'
SCHEMA=3
RULES='2026-11-17.3'
START_YEAR=datetime.datetime.now(datetime.timezone.utc).year-2
REQUIRED={'Company','Award Title','Award Year','Award Amount','Abstract','Agency','Contract','UEI','Duns'}

def clean(s):return re.sub(r'\s+',' ',re.sub(r'</?[A-Za-z][^>]*>',' ',str(s or ''))).strip()
def norm(s):return re.sub('[^A-Z0-9]','',clean(s).upper())
def uei(r):
 s=norm(r.get('UEI'));return s if len(s)==12 else ''
def duns(r):
 s=re.sub(r'\D','',r.get('Duns') or '');return s if len(s)==9 and s!='000000000' else ''
def name_state(r):return norm(r.get('Company'))+'|'+norm(r.get('State'))
def number(s):
 try:
  n=float(re.sub(r'[^0-9.\-]','',str(s)));return n if math.isfinite(n) and n>=0 else None
 except ValueError:return None

def identity_maps(records):
 du=collections.defaultdict(set);nu=collections.defaultdict(set)
 for r in records:
  u=uei(r);d=duns(r)
  if u:
   nu[name_state(r)].add(u)
   if d:du[d].add(u)
 return du,nu

def identity(r,maps):
 du,nu=maps;u=uei(r);d=duns(r)
 if u:return 'UEI:'+u,'UEI'
 if d and len(du.get(d,()))==1:return 'UEI:'+next(iter(du[d])),'DUNS linked to one UEI'
 if d:return 'DUNS:'+d,'DUNS'
 candidates=nu.get(name_state(r),set())
 if len(candidates)==1:return 'UEI:'+next(iter(candidates)),'Exact name + state linked to one UEI'
 return 'NAME:'+name_state(r),'Name + state only' if not candidates else 'Ambiguous name; kept separate'

def award_id(r,k,year,phase):
 agency=norm(r.get('Agency'));contract=norm(r.get('Contract'));tracking=norm(r.get('Agency Tracking Number'))
 # A contract in a different reported year or phase remains a separate record.
 anchor=('CONTRACT:'+contract) if contract else ('TRACKING:'+tracking if tracking else 'TITLE:'+norm(r.get('Award Title')))
 return hashlib.sha256('|'.join([agency,k,anchor,str(year),phase]).encode()).hexdigest()[:24]

def build(records,modified,etag,previous=None):
 maps=identity_maps(records);ledger={};quality=collections.Counter();raw_count=0
 for r in records:
  raw_count+=1;name=clean(r.get('Company'));title=clean(r.get('Award Title'));agency=clean(r.get('Agency'))
  try:year=int(r.get('Award Year') or '')
  except ValueError:quality['invalidAwardYear']+=1;continue
  if not name or not title or not agency or not 1980<=year<=datetime.datetime.now(datetime.timezone.utc).year+1:quality['missingCoreFields']+=1;continue
  k,match=identity(r,maps);phase=clean(r.get('Phase')).upper();ph='II' if re.search(r'\bII(?:A|B)?\b',phase) else 'I' if re.search(r'\bI(?:A|B)?\b',phase) else 'Other';rid=award_id(r,k,year,ph);amt=number(r.get('Award Amount'))
  row={'id':rid,'companyKey':k,'identityMethod':match,'awardeeName':name,'awardeeCity':clean(r.get('City')),'awardeeStateCode':clean(r.get('State')),'ueiNumber':uei(r),'title':title,'abstractText':clean(r.get('Abstract')),'agency':agency,'branch':clean(r.get('Branch')),'phase':ph,'program':clean(r.get('Program')),'date':clean(r.get('Proposal Award Date')),'expDate':clean(r.get('Contract End Date')),'awardYear':year,'amount':amt,'contract':clean(r.get('Contract')),'topic':clean(r.get('Topic Code')),'companyUrl':clean(r.get('Company Website'))}
  if rid in ledger:
   quality['duplicateRowsCollapsed']+=1;existing=ledger[rid]
   if existing['amount'] is not None and amt is not None and abs(existing['amount']-amt)>.01:
    if not existing.get('amountConflict'):quality['conflictingAwardAmounts']+=1
    existing['amountConflict']=True;existing['amount']=None
   elif existing['amount'] is None and amt is not None and not existing.get('amountConflict'):existing['amount']=amt
   if len(row['abstractText'])>len(existing['abstractText']):existing['abstractText']=row['abstractText']
   continue
  ledger[rid]=row
 histories={}
 for r in ledger.values():
  k=r['companyKey'];y=r['awardYear'];amt=r['amount'];ph=r['phase'];a=r['agency']
  h=histories.setdefault(k,{'count':0,'amount':0,'missing':0,'conflicts':0,'earliest':y,'latest':y,'agencies':{},'phaseCounts':{},'phaseAmounts':{},'years':{},'names':set(),'identityMethods':set()})
  h['count']+=1;h['amount']+=amt or 0;h['missing']+=amt is None;h['conflicts']+=bool(r.get('amountConflict'));h['earliest']=min(h['earliest'],y);h['latest']=max(h['latest'],y);h['agencies'][a]=h['agencies'].get(a,0)+1;h['phaseCounts'][ph]=h['phaseCounts'].get(ph,0)+1;h['phaseAmounts'][ph]=h['phaseAmounts'].get(ph,0)+(amt or 0);h['years'][str(y)]=h['years'].get(str(y),0)+(amt or 0);h['names'].add(r['awardeeName']);h['identityMethods'].add(r['identityMethod'])
 rows=sorted([r for r in ledger.values() if r['awardYear']>=START_YEAR],key=lambda r:(r['date'],r['awardYear'],r['id']),reverse=True);keys={r['companyKey'] for r in rows};histories={k:{**v,'names':sorted(v['names']),'identityMethods':sorted(v['identityMethods'])} for k,v in histories.items() if k in keys}
 quality.update({'recentRows':len(rows),'sourceRowsRead':raw_count,'recentMissingAbstracts':sum(not r['abstractText'] for r in rows),'recentMissingAmounts':sum(r['amount'] is None for r in rows),'recentMissingDates':sum(not r['date'] for r in rows),'recentNameOnlyIdentity':sum(r['identityMethod'].startswith(('Name','Ambiguous')) for r in rows)})
 return {'schemaVersion':SCHEMA,'rulesVersion':RULES,'checkedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'sourceModified':modified,'sourceEtag':etag,'sourceUrl':SOURCE,'since':str(START_YEAR)+'-01-01','sourceCadence':'Monthly','sourceRecordCount':len(ledger),'rows':rows,'histories':histories,'quality':dict(quality)}

def validate(result,previous=None):
 rows=result['rows'];agencies={r['agency'] for r in rows}
 if len(rows)<1000 or len(agencies)<8:raise ValueError('Too few records/agencies; previous publication retained')
 if len({r['id'] for r in rows})!=len(rows):raise ValueError('Duplicate award IDs')
 if not all(r['companyKey'] in result['histories'] for r in rows):raise ValueError('Missing company summaries')
 if previous and previous.get('schemaVersion')==SCHEMA:
  previous_window=[r for r in previous['rows'] if r['awardYear']>=START_YEAR]
  if len(rows)<len(previous_window)*.85:raise ValueError('Record count fell by more than 15%; review required')
  expected={r['agency'] for r in previous_window}
  if not expected.issubset(agencies):raise ValueError('Previously represented agency disappeared; review required')
 for h in result['histories'].values():
  if h['count']!=sum(h['phaseCounts'].values()):raise ValueError('Inconsistent company history')

def publish(result,checked=None):
 validate(result);payload=json.dumps(result,ensure_ascii=False,separators=(',',':')).encode();digest=hashlib.sha256(payload).hexdigest();name='sbir-data-'+digest[:16]+'.json.gz';PUBLISH.mkdir(parents=True,exist_ok=True)
 data_tmp=PUBLISH/(name+'.tmp');data_tmp.write_bytes(gzip.compress(payload,compresslevel=6,mtime=0));os.replace(data_tmp,PUBLISH/name)
 status={'schemaVersion':SCHEMA,'rulesVersion':RULES,'checkedAt':checked or datetime.datetime.now(datetime.timezone.utc).isoformat(),'sourceModified':result['sourceModified'],'sourceEtag':result['sourceEtag'],'rowCount':len(result['rows']),'agencyCount':len({r['agency'] for r in result['rows']}),'dataFile':name,'sha256':digest,'byteLength':len(payload),'since':result['since'],'automationMode':'github-actions' if os.environ.get('GITHUB_ACTIONS')=='true' else 'local-build'}
 tmp=PUBLISH/'sbir-status.tmp';tmp.write_text(json.dumps(status));os.replace(tmp,PUBLISH/'sbir-status.json')
 tmp=OUT.with_suffix('.tmp');tmp.write_bytes(payload);os.replace(tmp,OUT)
 return status

def collect():
 previous=None
 if OUT.exists():
  try:previous=json.loads(OUT.read_text())
  except (ValueError,OSError):pass
 headers={'User-Agent':'CEI-SBIR-Radar/3.0 (public-data dashboard)'}
 if previous and previous.get('schemaVersion')==SCHEMA and previous.get('rulesVersion')==RULES and previous.get('sourceEtag'):headers['If-None-Match']=previous['sourceEtag']
 response=None
 for attempt in range(3):
  try:response=urllib.request.urlopen(urllib.request.Request(SOURCE,headers=headers),timeout=90);break
  except urllib.error.HTTPError as e:
   if e.code==304 and previous:publish(previous);print('Source unchanged; collector check updated');return
   if e.code not in (408,429,500,502,503,504) or attempt==2:raise
  except (urllib.error.URLError,TimeoutError):
   if attempt==2:raise
  time.sleep(2**attempt)
 with tempfile.TemporaryDirectory() as d:
  csv_path=Path(d)/'awards.csv';written=0
  with response,csv_path.open('wb') as out:
   modified=response.headers.get('Last-Modified','');etag=response.headers.get('ETag','');expected=int(response.headers.get('Content-Length') or 0)
   while True:
    chunk=response.read(1024*1024)
    if not chunk:break
    out.write(chunk);written+=len(chunk)
  if expected and written!=expected:raise ValueError('Incomplete source download')
  with csv_path.open(encoding='utf-8-sig',newline='') as f:
   reader=csv.DictReader(f)
   if not REQUIRED.issubset(reader.fieldnames or []):raise ValueError('Unexpected source schema')
   records=list(reader)
  result=build(records,modified,etag,previous);validate(result,previous);status=publish(result)
 print('Validated',status['rowCount'],'recent records and',status['agencyCount'],'agencies;',result['quality'])
if __name__=='__main__':collect()
