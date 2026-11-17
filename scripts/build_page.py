"""Build small hosted startup and optional complete local preview."""
from pathlib import Path
import argparse,json
ROOT=Path(__file__).resolve().parents[1]

def page(data):
 head=(ROOT/'scripts/dashboard-head.html').read_text();script=(ROOT/'scripts/matching.js').read_text()+'\n'+(ROOT/'scripts/dashboard.js').read_text()
 payload=json.dumps(data,ensure_ascii=False,separators=(',',':')).replace('<','\\u003c')
 return head+'<script id="matcher-source" type="application/json">'+json.dumps((ROOT/'scripts/matching.js').read_text()).replace('<','\\u003c')+'</script><script id="seed" type="application/json">'+payload+'</script><script>'+script+'</script></body></html>'

def main():
 p=argparse.ArgumentParser();p.add_argument('--standalone');args=p.parse_args();data=json.loads((ROOT/'sbir-data.json').read_text())
 chosen={r['id']:r for r in data['rows'][:200]}
 for agency in sorted({r['agency'] for r in data['rows']}):
  for r in [x for x in data['rows'] if x['agency']==agency][:15]:chosen[r['id']]=r
 keys={r['companyKey'] for r in chosen.values()};seed={**data,'rows':list(chosen.values()),'histories':{k:v for k,v in data['histories'].items() if k in keys},'bundledPreview':True}
 html=page(seed);(ROOT/'index.html').write_text(html);(ROOT/'public').mkdir(exist_ok=True);(ROOT/'public/index.html').write_text(html)
 if args.standalone:Path(args.standalone).write_text(page(data))
 print('Built hosted page:',len(html.encode()),'bytes; bundled preview:',len(seed['rows']),'records')
if __name__=='__main__':main()
