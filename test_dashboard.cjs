const root=require('path').resolve(__dirname,'..');
const fs=require('fs'),vm=require('vm'),assert=require('assert'),crypto=require('crypto'),zlib=require('zlib');
const source=JSON.parse(fs.readFileSync(root+'/sbir-data.json','utf8'));
const status=JSON.parse(fs.readFileSync(root+'/public/sbir-status.json','utf8'));
let code=fs.readFileSync(root+'/scripts/matching.js','utf8')+'\n'+fs.readFileSync(root+'/scripts/dashboard.js','utf8');code=code.split("async function boot()")[0];
const els={},document={getElementById:id=>els[id]||(els[id]={textContent:id==='seed'?JSON.stringify(source):'',value:id==='period'?'730':'',options:[{}],innerHTML:'',style:{},querySelectorAll:()=>[],querySelector:()=>({textContent:''}),classList:{toggle(){}}}),documentElement:{}};
const ctx={document,location:{href:'https://example.github.io/radar/',protocol:'https:'},window:{},Date,Map,Set,URL,Intl,console,TextDecoder,TextEncoder,Uint8Array,ArrayBuffer,AbortController,Response,DecompressionStream,crypto:crypto.webcrypto,setTimeout:()=>0,clearTimeout(){},fetch:async()=>{throw Error('network outage')}};vm.createContext(ctx);vm.runInContext(code,ctx);vm.runInContext('prepare()',ctx);
(async()=>{
 const testBytes=fs.readFileSync(root+'/sbir-data.json');ctx.bytes=testBytes;ctx.status=status;
 const parsed=await vm.runInContext('decode(bytes,status)',ctx);assert.equal(parsed.rows.length,source.rows.length);
 ctx.bad=Buffer.from(testBytes);ctx.bad[20]^=1;await assert.rejects(vm.runInContext('decode(bad,status)',ctx),/integrity/);
 assert.throws(()=>vm.runInContext("validStatus({...status,dataFile:'../outside.json.gz'})",ctx),/Invalid/);
 assert.throws(()=>vm.runInContext("validStatus({...status,checkedAt:'2999-01-01'})",ctx),/Invalid/);
 const med=vm.runInContext("rows.find(r=>r.awardeeName.includes('MEDICARBONE'))",ctx);if(med){ctx.med=med;assert(vm.runInContext("FEATURES.get(med.id).sectors.includes('Medical devices & diagnostics')",ctx));}
 const checks=vm.runInContext('rows.slice(0,100).map(r=>({key:key(r),peers:peers(r).map(p=>({key:key(p.r),concepts:p.concepts.length}))}))',ctx);for(const c of checks){assert(c.peers.length<=5);assert.equal(new Set(c.peers.map(x=>x.key)).size,c.peers.length);for(const p of c.peers){assert.notEqual(p.key,c.key);assert(p.concepts>0)}}
 // Public copy must distinguish observed checks from an unverified schedule.
 assert.equal(vm.runInContext('SLIDE_SECONDS',ctx),10);
 ctx.clockStamp=Date.parse('2026-11-17T23:56:00Z');assert(vm.runInContext('azTime(clockStamp)',ctx).includes('4:56 PM'));assert(vm.runInContext('azTime(clockStamp)',ctx).endsWith(' AZ'));
 ctx.methodGap={evidence:{},connection:'Water monitoring',difference:'Approach details are incomplete in one or both records'};assert(vm.runInContext('comparisonCopy(methodGap).distinction',ctx).includes('not classified'));assert.equal(vm.runInContext('comparisonCopy(methodGap).question',ctx),'');
 // Explicit available-year labels and calendar start-year filtering.
 assert(els.period.innerHTML.includes('All years ('));
 assert(!els.period.innerHTML.includes('Loaded years'));
 ctx.savedRows=vm.runInContext('rows',ctx);ctx.yearRows=[{id:'2023',date:'2023-05-01'},{id:'2024',date:'2024-06-01'},{id:'unknown',date:''},{id:'future',date:'2999-01-01'}];vm.runInContext('rows=yearRows',ctx);els.period.value='year:2023';assert.equal(vm.runInContext('selected().map(r=>r.id).join()' ,ctx),'2023');els.period.value='0';assert.equal(vm.runInContext('selected().length',ctx),3);vm.runInContext('rows=savedRows',ctx);els.period.value='730';
 // An outage retains the last good dataset and never advances the collector clock.
 const before=vm.runInContext('source.checkedAt',ctx);await vm.runInContext('refresh()',ctx);assert.equal(vm.runInContext('source.checkedAt',ctx),before);assert(els.feedbanner.textContent.includes('SAVED DATA'));
 // Same-version checks download only the small manifest, preserve active company, and confirm integrity state.
 vm.runInContext('verified=true;feedStatus=status;index=2',ctx);const active=vm.runInContext('companies[index].companyKey',ctx);let calls=0;ctx.fetch=async()=>{calls++;return {ok:true,json:async()=>status}};await vm.runInContext('refresh()',ctx);assert.equal(calls,1);assert.equal(vm.runInContext('companies[index].companyKey',ctx),active);
 // Large file updates are actually decompressed and checked before use.
 vm.runInContext('verified=false;feedStatus=null',ctx);const gzip=fs.readFileSync(root+'/public/'+status.dataFile);calls=0;ctx.fetch=async()=>{calls++;return calls===1?{ok:true,json:async()=>status}:new Response(gzip)};await vm.runInContext('refresh()',ctx);assert.equal(calls,2);assert.equal(vm.runInContext('verified',ctx),true);
 // Also support a CDN that has already decompressed its Content-Encoding response.
 vm.runInContext('verified=false;feedStatus=null',ctx);calls=0;ctx.fetch=async()=>{calls++;return calls===1?{ok:true,json:async()=>status}:new Response(testBytes)};await vm.runInContext('refresh()',ctx);assert.equal(vm.runInContext('verified',ctx),true);
 // Private-mode storage failure must not block updates.
 ctx.window.indexedDB={};ctx.indexedDB={open(){throw Error('storage blocked')}};assert.equal(await vm.runInContext("cacheRequest('readonly',s=>s.get('last-good'))",ctx),null);
 // Fresh network connectivity cannot conceal an overdue collector or publication.
 vm.runInContext('source={...source,sourceModified:new Date().toUTCString()}',ctx);ctx.oldStatus={...status,checkedAt:new Date(Date.now()-4*86400000).toISOString(),automationMode:'github-actions'};vm.runInContext('feedStatus=oldStatus;lastFailure="";health()',ctx);assert.equal(els.health.textContent,'Collector update overdue');
 vm.runInContext("source={...source,sourceModified:new Date(Date.now()-90*86400000).toUTCString()};health()",ctx);assert.equal(els.health.textContent,'Older source file · Check details');
 ctx.location.protocol='file:';vm.runInContext('health()',ctx);assert(els.health.textContent.includes('Not automatically updating'));
 console.log('PASS production browser logic: digest tamper, invalid manifests, 100 peer sets, multilabel classification, outage retention, lightweight checks, real gzip loading, three freshness states, and explicit local snapshot label.');
})().catch(e=>{console.error(e);process.exitCode=1});
