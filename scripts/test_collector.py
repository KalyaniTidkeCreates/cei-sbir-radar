import copy,gzip,hashlib,io,json,tempfile,unittest
from pathlib import Path
from unittest.mock import patch
import update_data as m

def row(**kw):
 r={'Company':'ALPHA LLC','State':'Arizona','UEI':'ABCDEFGHIJK1','Duns':'123456789','Award Title':'Advanced optical measurement','Award Year':str(m.START_YEAR),'Award Amount':'100000','Agency':'Example Agency','Contract':'ABC-001','Phase':'Phase I','Abstract':'Technical abstract','Program':'SBIR','Proposal Award Date':str(m.START_YEAR)+'-01-01'};r.update(kw);return r

def fixture(n=1000):
 rows=[{'id':hashlib.sha256(str(i).encode()).hexdigest()[:24],'companyKey':str(i),'agency':'Agency '+str(i%8),'awardYear':m.START_YEAR} for i in range(n)]
 return {'schemaVersion':3,'rulesVersion':m.RULES,'sourceModified':'Sun, 01 Nov 2026 05:42:37 GMT','sourceEtag':'test','since':str(m.START_YEAR)+'-01-01','rows':rows,'histories':{str(i):{'count':1,'phaseCounts':{'I':1}} for i in range(n)}}

class CollectorTests(unittest.TestCase):
 def test_unique_identifier_bridge(self):
  a=row(UEI='',Contract='OLD');b=row(Contract='NEW');d=m.build([a,b],'','');self.assertEqual(len(d['histories']),1);self.assertEqual(next(iter(d['histories'].values()))['count'],2)
 def test_ambiguous_duns_is_not_merged(self):
  a=row(UEI='ABCDEFGHIJK1',Contract='A');b=row(UEI='ABCDEFGHIJK2',Contract='B');c=row(UEI='',Contract='C');d=m.build([a,b,c],'','');self.assertEqual(len(d['histories']),3)
 def test_identical_names_different_states_stay_apart(self):
  a=row(UEI='',Duns='',State='Arizona');b=row(UEI='',Duns='',State='California');d=m.build([a,b],'','');self.assertEqual(len(d['histories']),2)
 def test_title_correction_does_not_double_count(self):
  a=row();b=row(**{'Award Title':'Corrected project title'});d=m.build([a,b],'','');self.assertEqual(len(d['rows']),1);self.assertEqual(d['quality']['duplicateRowsCollapsed'],1)
 def test_amount_conflict_is_not_guessed(self):
  a=row();b=row(**{'Award Amount':'200000'});d=m.build([a,b],'','');self.assertIsNone(d['rows'][0]['amount']);self.assertEqual(next(iter(d['histories'].values()))['amount'],0);self.assertEqual(d['quality']['conflictingAwardAmounts'],1)
 def test_invalid_amounts(self):
  for s in ['NaN','inf','-1','']:
   self.assertIsNone(m.number(s))
 def test_record_drop_is_blocked(self):
  with self.assertRaisesRegex(ValueError,'15%'):m.validate(fixture(1000),fixture(2000))
 def test_missing_agency_is_blocked(self):
  old=fixture(1000);old['rows'][0]['agency']='Disappeared'
  with self.assertRaisesRegex(ValueError,'agency disappeared'):m.validate(fixture(1000),old)
 def test_manifest_matches_compressed_payload(self):
  oldout,oldpub=m.OUT,m.PUBLISH
  try:
   with tempfile.TemporaryDirectory() as d:
    m.OUT=Path(d)/'data.json';m.PUBLISH=Path(d)/'public';status=m.publish(fixture());data=gzip.decompress((m.PUBLISH/status['dataFile']).read_bytes());self.assertEqual(hashlib.sha256(data).hexdigest(),status['sha256']);self.assertEqual(len(data),status['byteLength']);self.assertEqual(json.loads(data)['rows'],fixture()['rows'])
  finally:m.OUT,m.PUBLISH=oldout,oldpub
 def test_truncated_download_keeps_previous_file(self):
  oldout,oldpub=m.OUT,m.PUBLISH
  class Response(io.BytesIO):headers={'Content-Length':'999','Last-Modified':'Sun, 01 Nov 2026 05:42:37 GMT'}
  try:
   with tempfile.TemporaryDirectory() as d:
    m.OUT=Path(d)/'data.json';m.PUBLISH=Path(d)/'public';m.OUT.write_text(json.dumps(fixture()));before=m.OUT.read_bytes()
    with patch('urllib.request.urlopen',return_value=Response(b'short')):
     with self.assertRaisesRegex(ValueError,'Incomplete source download'):m.collect()
    self.assertEqual(m.OUT.read_bytes(),before);self.assertFalse(m.PUBLISH.exists())
  finally:m.OUT,m.PUBLISH=oldout,oldpub
if __name__=='__main__':unittest.main()
