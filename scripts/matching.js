/* Transparent, problem-first rules. These are inferred relationships, not verified competitors. */
const MATCH_WEIGHTS=Object.freeze({problem:40,useCase:25,approach:15,constraints:10,customer:5,milestone:5});
const PROBLEM_RULES=[
 {id:'wafer-inspection',titleReject:/infrared detector|detector array|photodetector/i,name:'Detect defects in semiconductor wafers',goal:/(?:\bdetect(?:ion|ing|s)?\b|inspect|measur|map|metrolog|monitor|quality control).{0,100}(?:defect|surface|bond|wafer)|(?:defect|surface|bonding).{0,100}(?:\bdetect(?:ion|ing|s)?\b|inspect|measur|quality control|metrolog)/i,context:/wafer|semiconductor manufactur|chip manufactur/i,reject:/diamond defect|defect quantum|color center|colour center|nitrogen.vacancy/i,use:'Semiconductor manufacturing',useRe:/wafer|semiconductor|chip manufactur/i},
 {id:'wafer-repair',name:'Repair semiconductor wafer defects',goal:/repair|defect remov|surface restor/i,context:/wafer|semiconductor/i,use:'Semiconductor manufacturing',useRe:/wafer|semiconductor/i},
 {id:'cryogenic-links',name:'Optical modulation at cryogenic temperatures',goal:/cryogenic|low.temperature/i,context:/modulat|transceiv|optical (?:link|interconnect)/i,use:'Cryogenic optical systems',useRe:/cryogenic|low.temperature/i},
 {id:'chip-cooling',name:'Remove heat from chips and electronics',goal:/cooling|heat remov|thermal management|heat dissipat/i,context:/chip|semiconductor|electronic|data center/i,use:'Electronic thermal management',useRe:/chip|semiconductor|electronic|data center/i},
 {id:'cancer-detection',name:'Detect cancer',goal:/detect|diagnos|screening/i,context:/cancer|tumor|tumour/i,use:'Cancer diagnostics',useRe:/cancer|tumor|tumour/i},
 {id:'cancer-treatment',name:'Treat cancer',goal:/treat|therap|kill|inhibit/i,context:/cancer|tumor|tumour/i,use:'Cancer treatment',useRe:/cancer|tumor|tumour/i},
 {id:'pathogen-detection',name:'Detect infectious pathogens',goal:/detect|diagnos|identif|gram.stain/i,context:/gram.stain|bloodstream infection|virus|viral|pathogen|infectious|bacterial infection|bacteremia|sepsis|peritonitis|aspergill/i,use:'Infectious-disease testing',useRe:/infectious|pathogen|virus|viral|bacteri/i},
 {id:'sample-enrichment',name:'Concentrate pathogens before testing',goal:/enrich|concentrat|isolat/i,context:/virus|viral|pathogen/i,use:'Infectious-disease testing',useRe:/virus|viral|pathogen/i},
 {id:'fracture-fixation',name:'Stabilize and repair bone fractures',titleReject:/postoperative|post.operativ|sensoriz|monitor|physical therapy|drug delivery|brain injur|neuroprotect/i,goal:/fixation|repair|stabiliz/i,context:/fracture|bone|intramedullary/i,use:'Orthopedic fracture care',useRe:/fracture|orthoped|orthopaed|intramedullary/i},
 {id:'fracture-monitoring',name:'Monitor bone-fracture healing',goal:/monitor|sensoriz|postoperative|load sens/i,context:/fracture|bone heal|bone plate/i,use:'Orthopedic fracture care',useRe:/fracture|bone heal|bone plate/i},
 {id:'hearing-restoration',name:'Restore or protect hearing',goal:/restor|protect|treat|improv/i,context:/hearing|cochlear|auditory/i,use:'Hearing care',useRe:/hearing|cochlear|auditory/i},
 {id:'retinal-imaging',name:'Detect or monitor retinal disease',goal:/detect|monitor|diagnos|imag/i,context:/retina|macular/i,use:'Retinal care',useRe:/retina|macular/i},
 {id:'glucose-monitoring',name:'Measure glucose for diabetes management',goal:/measur|monitor|sens/i,context:/glucose|blood sugar/i,use:'Diabetes management',useRe:/diabet|glucose|blood sugar/i},
 {id:'water-detection',name:'Detect contaminants in water',goal:/detect|monitor|measur|sens/i,context:/water quality|water contamin|wastewater|drinking water|groundwater|haloacetic|pfas/i,use:'Water-quality management',useRe:/water quality|water contamin|wastewater|drinking water/i},
 {id:'water-disposal',name:'Manage onsite wastewater disposal',goal:/dispos/i,context:/wastewater|sewage/i,use:'Wastewater management',useRe:/wastewater|sewage/i},
 {id:'water-removal',name:'Remove contaminants from water',goal:/remov|purif|treat|filter|separat/i,context:/wastewater|drinking water|water contamin|water treatment|water purif|pfas/i,use:'Water-quality management',useRe:/water|pfas/i},
 {id:'carbon-capture',name:'Capture carbon dioxide',goal:/captur|separat|remov/i,context:/carbon dioxide|\bco2\b/i,use:'Carbon management',useRe:/carbon dioxide|\bco2\b|flue gas|direct air/i},
 {id:'hydrogen-production',name:'Produce hydrogen',goal:/produc|generat|electrolys|electrolyz/i,context:/hydrogen/i,use:'Hydrogen production',useRe:/hydrogen/i},
 {id:'battery-safety',name:'Prevent battery fires and thermal runaway',goal:/prevent|detect|mitigat|safety|suppress/i,context:/thermal runaway|battery fire|lithium.ion.*fire/i,use:'Battery safety',useRe:/battery|batteries|lithium/i},
 {id:'battery-recycling',name:'Recover materials from used batteries',goal:/recycl|recover|reclaim/i,context:/battery|batteries|lithium|cathode/i,use:'Battery recycling',useRe:/battery|batteries|cathode/i},
 {id:'solar-efficiency',titleReject:/power conversion|power converter|inverter/i,name:'Improve photovoltaic conversion',goal:/efficien|conversion|tandem|light harvest/i,context:/solar|photovoltaic/i,use:'Photovoltaic generation',useRe:/solar|photovoltaic|perovskite/i},
 {id:'malware-detection',name:'Detect malicious software',goal:/detect|identif|classif|analy/i,context:/malware|ransomware|malicious software/i,use:'Cybersecurity operations',useRe:/malware|ransomware|malicious software/i},
 {id:'vulnerability-repair',name:'Find and repair software vulnerabilities',goal:/detect|find|repair|patch/i,context:/vulnerabilit|binary software/i,use:'Software security',useRe:/software|binar|code|vulnerabilit/i},
 {id:'gps-denied',name:'Navigate without reliable GPS',goal:/navigat|position|localiz/i,context:/gps.denied|gnss.denied|without gps|gps.unavailable/i,use:'GPS-denied navigation',useRe:/gps.denied|gnss.denied|without gps|gps.unavailable/i},
 {id:'orbital-debris',name:'Detect and track orbital debris',goal:/detect|track|monitor/i,context:/orbital debris|space debris|space object/i,use:'Space situational awareness',useRe:/orbital|space debris|space object/i},
 {id:'crop-disease',name:'Detect crop disease',goal:/detect|diagnos|identif/i,context:/crop|plant disease|crop pathogen/i,use:'Crop protection',useRe:/crop|plant disease|crop pathogen/i},
 {id:'industrial-leak',name:'Detect gas leaks',goal:/detect|localiz|monitor/i,context:/methane|gas leak|pipeline leak/i,use:'Gas infrastructure monitoring',useRe:/methane|gas leak|pipeline/i}
];
const METHOD_RULES={
 'Gram-stain microscopy':/gram.stain/i,'Peripheral-nerve stimulation':/peripheral nerve stimulat|nerve stimulat/i,'Neural interface':/neural interface|nervous interface|neural probe/i,
 'Optical interferometry':/interferometr/i,'Raman spectroscopy':/raman/i,'Acoustic sensing':/acoustic sens|ultrasonic sens|ultrasound sens|acoustic imag/i,
 'Electrical impedance sensing':/impedance|dielectrophore/i,'Electrochemical sensing':/electrochemical sens|electrochemical detect/i,
 'Optical spectroscopy':/optical spectroscop|infrared spectroscop|absorption spectroscop/i,'Fluorescence sensing':/fluorescen/i,
 'Chromatographic analysis':/chromatograph/i,'Fluoride-ion detection':/fluoride ion detect/i,'MOF photocatalysis':/photocatalytic.{0,25}mof|mof.{0,25}photocatalytic/i,
 'Mass spectrometry':/mass spectrometr/i,'PCR amplification':/\bpcr\b|polymerase chain reaction/i,'Molecular sequencing':/next.generation sequencing|dna sequencing|rna sequencing/i,
 'Immunoassay':/immunoassay|antibody.based detect|immunochromatograph/i,'CRISPR-based method':/crispr/i,
 'Micro-ring modulation':/micro.ring|microring|ring modulator|\bmrm\b/i,'Mach–Zehnder modulation':/mach.zehnder|\bmzi\b/i,
 'Conducting-oxide modulation':/conducting oxide|transparent conductive oxide|\btco\b/i,'Structured-light metrology':/structured light|autocollimat/i,
 'Optical coherence tomography':/optical coherence tomography|\boct\b/i,'Machine-learning model':/machine learning|deep learning|neural network|artificial intelligence/i,
 'Small-molecule therapy':/small.molecule|small molecule/i,'Antibody therapy':/monoclonal antibod|antibody.drug conjugate/i,
 'Cell therapy':/cell therap|stem cell therap/i,'Gene therapy':/gene therap/i,
 'Membrane separation':/membrane.{0,60}(?:filter|separat|treat|purif)|reverse osmosis/i,'Adsorption':/adsorben|adsorption/i,'Electrolysis':/electroly[sz]/i,
 'Perovskite materials':/perovskite/i,'Silicon photovoltaics':/silicon solar|silicon.*photovoltaic/i,
 'Radar sensing':/\bradar\b/i,'Lidar sensing':/\blidar\b|laser ranging/i,'Magnetic sensing':/magnetomet|magnetic sens/i,
 'Implant load sensing':/sensorized bone plate|load sensor|sensorized.{0,25}implant/i,'Mechanical fixation':/intramedullary nail|bone plate|fixation screw/i,'Polymer-based implant':/polymer.*implant|polymer sleeve|injectable resin/i,
 'Thermal separation':/thermal evaporat|distillat/i,'Chemical leaching':/hydrometallurg|acid leach|chemical leach/i
};
const CUSTOMER_RULES={'Semiconductor manufacturers':/chipmaker|semiconductor manufacturer|semiconductor fab/i,'Clinicians and hospitals':/clinician|surgeon|hospital/i,'Water utilities':/water utilit|municipal water/i,'Farmers and growers':/farmer|grower/i,'Defense operators':/warfighter|military operator|military personnel/i,'Battery manufacturers':/battery manufacturer/i};
const MILESTONE_RULES={'Feasibility evaluation':/feasibility (?:stud|evaluat|assess)/i,'Prototype development':/develop.{0,35}prototype|prototype develop/i,'Pilot demonstration':/pilot.scale|pilot demonstration/i,'Preclinical testing':/preclinical (?:test|stud|validat)/i,'Clinical validation':/clinical validation|clinical trial/i};
const TARGET_RULES={water:{'PFAS':/\bpfas\b|per.and polyfluoroalkyl/i,'Haloacetic acids':/haloacetic|\bhaas?\b/i,'Dissolved carbon compounds':/dissolved co2|dissolved carbon dioxide/i,'Nutrients':/nitrogenous|nitrification|nitrogen compounds|nitrate|nitrite|ammonium/i,'Metal contaminants':/nickel|chromium|mercury|arsenic|cadmium|heavy metal/i},cancer:{'Breast cancer':/breast cancer|breast tumor/i,'Lung cancer':/lung cancer|lung tumor/i,'Pancreatic cancer':/pancreatic cancer|pancreatic tumor/i,'Prostate cancer':/prostate cancer/i,'Colorectal cancer':/colorectal cancer|colon cancer/i,'Brain cancer':/glioblastoma|brain tumor/i},pathogen:{'Bacterial pathogens':/gram.stain|bacteri|sepsis|septicemia/i,'Viral pathogens':/virus|viral|influenza|sars.cov|covid/i,'Fungal pathogens':/fungal|fungus|aspergill/i,'Prion proteins':/\bprion/i,'Sepsis':/sepsis|septicemia/i,'Aspergillosis':/aspergill/i,'Bacterial peritonitis':/bacterial peritonitis/i,'SARS-CoV-2':/sars.cov.2|covid.19/i,'Influenza':/influenza/i,'Tuberculosis':/tuberculosis|mycobacterium/i,'Malaria':/malaria|plasmodium/i}};
const USE_SCOPES={
 'water-detection':{'Coastal water systems':/coastal|marine|ocean|seawater/i,'Groundwater remediation':/groundwater|tank waste|hazardous waste site/i,'Drinking-water management':/drinking water|potable|municipal water/i,'Wastewater management':/wastewater|sewage/i,'Industrial process water':/industrial.{0,20}water|process water/i},
 'water-removal':{'Coastal water systems':/coastal|marine|ocean|seawater/i,'Groundwater remediation':/groundwater|tank waste|hazardous waste site/i,'Drinking-water management':/drinking water|potable|municipal water/i,'Wastewater management':/wastewater|sewage/i,'Industrial process water':/industrial.{0,20}water|process water/i},
 'solar-efficiency':{'Space photovoltaics':/spacecraft|satellite|space solar/i,'Building photovoltaics':/residential|rooftop|building.integrat|facade/i,'Vehicle photovoltaics':/vehicle.integrat|automotive|vehicle roof/i},
 'cancer-detection':{'Blood-based cancer testing':/blood|liquid biops|circulating tumor/i,'Tissue-based cancer testing':/tissue biops|histopath|excised tissue/i,'Cancer imaging':/cancer imag|tumor imag|magnetic resonance|tomography/i},
 'pathogen-detection':{'Clinical pathogen testing':/clinical|patient|point.of.care|nasal swab/i,'Environmental pathogen testing':/environmental|wastewater|ecological|water sample/i,'Food pathogen testing':/food|poultry|dairy/i},
 'sample-enrichment':{'Clinical pathogen testing':/clinical|patient|point.of.care|nasal swab/i,'Environmental pathogen testing':/environmental|wastewater|ecological|water sample/i,'Food pathogen testing':/food|poultry|dairy/i}
};
const targetFamily=id=>id.startsWith('water-')?'water':id.startsWith('cancer-')?'cancer':['pathogen-detection','sample-enrichment'].includes(id)?'pathogen':null;
const COMPLEMENT_PAIRS=[['fracture-fixation','fracture-monitoring'],['sample-enrichment','pathogen-detection'],['water-detection','water-removal'],['wafer-inspection','wafer-repair']];

const APPLICATION_RULES={
 'Neural interface systems':/neural interface|nervous interface|neural probe|sensory white.matter|sensory restor/i,
 'Medical anatomical modeling':/anatomical model|pre.surgical planning|preoperative planning|trauma.{0,35}procedural planning/i,
 'Semiconductor manufacturing':/wafer|semiconductor manufactur|chip fabricat/i,
 'Cryogenic optical systems':/cryogenic.{0,70}(?:modulat|optical)|(?:modulat|optical).{0,70}cryogenic/i,
 'Orthopedic fracture care':/fracture|orthoped|orthopaed|intramedullary/i,
 'Clinical pathogen testing':/sepsis|infectious.disease test|clinical pathogen|point.of.care.{0,50}infect/i,
 'Coastal water systems':/coastal|marine water|ocean water/i,
 'Groundwater remediation':/groundwater|tank waste|hazardous waste site/i,
 'Drinking-water management':/drinking water|potable water|municipal water/i,
 'Wastewater management':/wastewater|sewage/i,
 'Space photovoltaics':/spacecraft.{0,60}solar|solar.{0,60}spacecraft|space photovoltaic/i,
 'Building photovoltaics':/rooftop|residential.{0,35}(?:solar|photovoltaic)|building.integrat/i,
 'Vehicle photovoltaics':/vehicle.integrat.{0,40}(?:solar|photovoltaic)/i,
 'Cancer diagnostics':/cancer diagnos|cancer detect|tumor detect|liquid biops/i,
 'Cancer treatment':/cancer therap|cancer treat|tumor treat/i,
 'Battery recycling':/battery recycl|spent batter|recycl.{0,35}lithium/i,
 'Hydrogen production':/hydrogen produc|produc.{0,25}hydrogen|hydrogen generat/i,
 'GPS-denied navigation':/gps.denied|gnss.denied|without gps/i,
 'Cybersecurity operations':/malware|ransomware|intrusion detect|vulnerability patch/i,
 'Industrial biomanufacturing':/bioreactor|fermentation|biomanufactur/i,
 'Crop protection':/crop disease|crop protect|precision agricultur|plant pathogen/i
};
const CONSTRAINT_RULES={
 'Cryogenic operation':/cryogenic|liquid.helium temperature/i,'High-temperature operation':/high.temperature operat|harsh.temperature/i,
 'Low-power operation':/low.power|ultra.low power|power.constrain/i,'Real-time operation':/real.time/i,
 'Non-invasive measurement':/non.invasive/i,'Non-destructive inspection':/non.destructive/i,
 'Point-of-care use':/point.of.care/i,'Portable deployment':/portable|hand.held/i,
 'GPS-denied operation':/gps.denied|gnss.denied/i,'Radiation tolerance':/radiation.hard|rad.hard|radiation.toleran/i,
 'Sterile operation':/sterile|aseptic/i,'Industrial-scale production':/industrial.scale|high.volume manufactur/i
};
const TITLE_STOP=new Set('sbir sttr phase the and for with from into based novel new project research development develop developing system systems technology technologies approach platform platforms method methods using applications application advanced rapid improve improved improvement efficient efficiency performance study studies design innovation commercial small business innovative support enable enabling scalable scaling high low next generation toward towards through capable specific integrated development validation validate demonstration'.split(' '));
const TITLE_NONANCHOR=new Set('ai artificial intelligence machine learning software data sensor sensing optical quantum algorithm computing electronic electronics device devices model models print printing 3d detect detection monitor monitoring analysis processing network networks interferometry spectroscopy raman acoustic electrochemical fluorescence chromatography pcr sequencing immunoassay crispr'.split(' '));
const TITLE_CANON={defects:'defect',fractures:'fracture',diagnostics:'diagnostic',batteries:'battery',viruses:'virus',viral:'virus',photovoltaics:'photovoltaic',printing:'print',printed:'print',surgeries:'surgical',surgery:'surgical',manufacturing:'manufacture',manufactured:'manufacture',treatments:'treatment',tumors:'tumor',cells:'cell',wafers:'wafer',materials:'material',models:'model',devices:'device',sensors:'sensor',detecting:'detect',detection:'detect',monitoring:'monitor',imaging:'image',images:'image',diagnosis:'diagnostic',planning:'plan'};
function titleTerms(r){return new Set((text(r.title).toLowerCase().match(/[a-z][a-z0-9-]{2,}|3d/g)||[]).filter(t=>!TITLE_STOP.has(t)).map(t=>TITLE_CANON[t]||t))}
let TITLE_INDEX=new Map(),USE_INDEX=new Map(),COMPANY_PROJECTS=new Map(),TERM_DF=new Map(),TERM_N=0;
const termWeight=t=>Math.log(1+(TERM_N||20)/(TERM_DF.get(t)||1));
let MATCH_TEXT=new WeakMap();
function sourceParts(r){let p=MATCH_TEXT.get(r);if(!p){const title=text(r.title),body=text(r.abstractText);p={title,body,sentences:body.split(/[.!?](?:\s+|[\u0100\u00a0]+\s*)/)};MATCH_TEXT.set(r,p)}return p}
let MATCH_PROFILE=new Map(),MATCH_PROBLEM_INDEX=new Map(),MATCH_METHOD_INDEX=new Map(),MATCH_ROWS=new Map(),MATCH_CACHE=new Map();
function matchedEvidence(r,re,proposedOnly=false){const {title,body,sentences}=sourceParts(r);if(re.test(title))return {quote:title,confidence:1};const sentence=sentences.find(x=>re.test(x)&&(!proposedOnly||/propos|develop|our |this (?:project|technology|approach)|we (?:will|use)|\bwill\b|\buses?\b|utiliz|employ|integrat/i.test(x)&&!/unlike|rather than|instead of|without|conventional|traditional|does not rely|do not rely|not rely|not use|avoid using|avoid the use|compared to|state.of.the.art|existing (?:method|technique)/i.test(x)));return sentence?{quote:sentence.slice(0,420),confidence:.8}:null}
function profileOf(r){
 const parts=sourceParts(r),title=parts.title,sentences=[title,...parts.sentences],problems=new Map(),uses=new Map();
 for(const rule of PROBLEM_RULES){if(rule.titleReject?.test(title))continue;if(!rule.goal.test(title+' '+parts.body)||!rule.context.test(title+' '+parts.body))continue;if(rule.reject&&rule.reject.test(title)&&!(/wafer|semiconductor manufactur/i).test(title))continue;const sentence=sentences.find(s=>{const match=rule.goal.exec(s);if(!match)return false;const local=s.slice(Math.max(0,match.index-140),match.index+match[0].length+140);return rule.context.test(local)&&!/(?:previous|prior|published) stud/i.test(local)&&(s===title||/this project|propos|we |our |aim|seek|develop|will|goal|objective/i.test(local))});if(!sentence)continue;const use=matchedEvidence(r,rule.useRe);if(!use)continue;problems.set(rule.id,{rule,quote:sentence.slice(0,420),confidence:sentence===title?1:.85});if(USE_SCOPES[rule.id]){for(const [name,re]of Object.entries(USE_SCOPES[rule.id])){const evidence=matchedEvidence(r,re,true);if(evidence)uses.set(name,evidence)}}else uses.set(rule.use,use)}
 // A title-defined outcome takes precedence over incidental supporting work in the abstract.
 const titleProblems=[...problems].filter(([,e])=>e.quote===title);if(titleProblems.length){const primary=new Set(titleProblems.map(([id])=>id));for(const id of problems.keys())if(!primary.has(id))problems.delete(id)}
 const extract=(rules,proposed=false)=>new Map(Object.entries(rules).map(([name,re])=>[name,matchedEvidence(r,re,proposed)]).filter(x=>x[1]));
 for(const [name,re]of Object.entries(APPLICATION_RULES)){if(!uses.has(name)){const e=matchedEvidence(r,re,true);if(e)uses.set(name,e)}}
 const titleUses=[...uses].filter(([,e])=>e.quote===title);if(titleUses.length){const primary=new Set(titleUses.map(([id])=>id));for(const id of uses.keys())if(!primary.has(id))uses.delete(id)}
 return {title,scope:projectScope(r),lex:lexicalProfile(r),educationPurpose:/literacy|curricul|educational|education|classroom|teaching|student learning|learning game|workforce training/i.test(title),terms:titleTerms(r),constraints:extract(CONSTRAINT_RULES,true),problems,uses,methods:extract(METHOD_RULES,true),customers:extract(CUSTOMER_RULES),milestones:extract(MILESTONE_RULES),targets:new Map(Object.entries(TARGET_RULES).map(([k,v])=>[k,extract(v,true)]))};
}
function indexStructuredMatching(list){MATCH_TEXT=new WeakMap();MATCH_PROFILE=new Map();MATCH_PROBLEM_INDEX=new Map();MATCH_METHOD_INDEX=new Map();MATCH_CACHE=new Map();MATCH_ROWS=new Map(list.map(r=>[r.id,r]));TITLE_INDEX=new Map();USE_INDEX=new Map();COMPANY_PROJECTS=new Map();TERM_DF=new Map();TERM_N=list.length;
 const add=(map,k,id)=>{if(!map.has(k))map.set(k,new Set());map.get(k).add(id)};
 for(const r of list){const p=profileOf(r);MATCH_PROFILE.set(r.id,p);if(!COMPANY_PROJECTS.has(key(r)))COMPANY_PROJECTS.set(key(r),[]);COMPANY_PROJECTS.get(key(r)).push(r);for(const id of p.problems.keys())add(MATCH_PROBLEM_INDEX,id,r.id);for(const method of p.methods.keys())add(MATCH_METHOD_INDEX,method,r.id);for(const use of p.uses.keys())add(USE_INDEX,use,r.id);for(const term of p.terms){add(TITLE_INDEX,term,r.id);TERM_DF.set(term,(TERM_DF.get(term)||0)+1)}}
 for(const arr of COMPANY_PROJECTS.values())arr.sort((a,b)=>date(b.date)-date(a.date));
}
const TASK_METHODS={
 'wafer-inspection':['Structured-light metrology','Optical interferometry','Electrical impedance sensing','Optical spectroscopy','Acoustic sensing'],
 'cryogenic-links':['Micro-ring modulation','Mach–Zehnder modulation','Conducting-oxide modulation'],
 'fracture-fixation':['Polymer-based implant','Mechanical fixation'],
 'fracture-monitoring':['Implant load sensing','Electrical impedance sensing'],
 'water-detection':['Raman spectroscopy','Optical spectroscopy','Electrochemical sensing','Fluorescence sensing','Mass spectrometry','Electrical impedance sensing'],
 'cancer-treatment':['Small-molecule therapy','Antibody therapy','Cell therapy','Gene therapy'],
 'pathogen-detection':['Gram-stain microscopy','PCR amplification','Molecular sequencing','Immunoassay','CRISPR-based method','Mass spectrometry']
};
function taskMethods(p,id){const preferred=(TASK_METHODS[id]||[]).filter(k=>p.methods.has(k));if(preferred.length)return new Map(preferred.map(k=>[k,p.methods.get(k)]));const specific=[...p.methods].filter(([k])=>k!=='Machine-learning model');return specific.length?new Map(specific):p.methods}
const commonKeys=(a,b)=>[...a.keys()].filter(k=>b.has(k));

function lexicalEvidence(a,b){const shared=[...a.terms].filter(t=>b.terms.has(t));const anchors=shared.filter(t=>!TITLE_NONANCHOR.has(t));const weight=shared.reduce((s,t)=>s+termWeight(t),0),wa=[...a.terms].reduce((s,t)=>s+termWeight(t),0),wb=[...b.terms].reduce((s,t)=>s+termWeight(t),0);return {shared:shared.sort((x,y)=>termWeight(y)-termWeight(x)),anchors,similarity:weight/Math.sqrt(Math.max(1,wa*wb))}}
function structuredRelationFor(a,b){
 // Educational content about a technology is a different primary purpose from building that technology.
 if(a.educationPurpose!==b.educationPurpose)return null;
 if((a.scope==='Identity verification'&&b.scope==='Restoration of neural function')||(b.scope==='Identity verification'&&a.scope==='Restoration of neural function'))return null;
 const rawProblems=commonKeys(a.problems,b.problems),targetDifferences=[];
 const shared=rawProblems.filter(id=>{const family=targetFamily(id);if(!family)return true;const x=a.targets.get(family),y=b.targets.get(family);if(x.size&&y.size&&!commonKeys(x,y).length){targetDifferences.push([...x.keys()].join(', ')+' vs '+[...y.keys()].join(', '));return family==='water'}return true});
 const uses=commonKeys(a.uses,b.uses),customers=commonKeys(a.customers,b.customers),milestones=commonKeys(a.milestones,b.milestones),constraints=commonKeys(a.constraints,b.constraints),lex=lexicalEvidence(a,b);
 const specificMethods=commonKeys(a.methods,b.methods).filter(m=>m!=='Machine-learning model');
 // Keep a known engineering ambiguity from being promoted by shared words.
 const waferMismatch=(a.problems.has('wafer-inspection')&&/diamond defect quantum|solid.state diamond defect|defect quantum systems/i.test(b.title)&&!/wafer|semiconductor manufactur/i.test(b.title))||(b.problems.has('wafer-inspection')&&/diamond defect quantum|solid.state diamond defect|defect quantum systems/i.test(a.title)&&!/wafer|semiconductor manufactur/i.test(a.title));if(waferMismatch)return null;
 let workflow=null;for(const [x,y]of COMPLEMENT_PAIRS){if(a.problems.has(x)&&b.problems.has(y)){workflow={a:a.problems.get(x),b:b.problems.get(y)};break}if(a.problems.has(y)&&b.problems.has(x)){workflow={a:a.problems.get(y),b:b.problems.get(x)};break}}
 const titleSupported=lex.shared.length>=2&&lex.anchors.length>=1&&lex.similarity>=.17;
 const capableAdjacent=specificMethods.length>0&&a.problems.size>0&&b.problems.size>0;
 // Multiple independent signals are needed; a generic technology match does not suffice.
 if(!shared.length&&!(workflow&&uses.length)&&!titleSupported&&!(capableAdjacent&&(uses.length||constraints.length||lex.anchors.length)))return null;
 const problem=shared.map(id=>({id,a:a.problems.get(id),b:b.problems.get(id)})).sort((x,y)=>Math.min(y.a.confidence,y.b.confidence)-Math.min(x.a.confidence,x.b.confidence))[0];
 const methodA=taskMethods(a,problem?.id||''),methodB=taskMethods(b,problem?.id||''),commonMethod=commonKeys(methodA,methodB).find(m=>m!=='Machine-learning model')||commonKeys(methodA,methodB)[0];
 const left=commonMethod||methodA.keys().next().value,right=commonMethod||methodB.keys().next().value;
 const differentUses=a.uses.size&&b.uses.size&&!uses.length;
 let tag=problem?'Problem overlap':uses.length?(uses[0]==='Coastal water systems'?'Shared setting':'Application overlap'):'Shared title terms';
 if(problem&&uses.length&&!targetDifferences.length&&left&&right&&left!==right)tag='Different approaches';
 else if(workflow&&uses.length&&!problem)tag='Workflow connection';
 else if(!problem&&!uses.length&&specificMethods.length)tag='Shared method';
 const connection=problem?problem.a.rule.name+(uses.length?' · '+uses[0]:''):workflow&&uses.length?workflow.a.rule.name+' → '+workflow.b.rule.name:uses.length?uses[0]:lex.shared.slice(0,4).join(' · ');

 const problemSignal=problem?Math.min(problem.a.confidence,problem.b.confidence)*(targetDifferences.length?.45:1):workflow&&uses.length?.68:targetDifferences.length?.32:titleSupported?Math.min(.72,lex.similarity*1.25):.22;
 const approachSignal=left&&right?Math.min(methodA.get(left)?.confidence||0,methodB.get(right)?.confidence||0):0;
 const components={problem:40*problemSignal,useCase:uses.length?25*Math.min(a.uses.get(uses[0]).confidence,b.uses.get(uses[0]).confidence):0,approach:15*approachSignal,constraints:constraints.length?10*Math.min(a.constraints.get(constraints[0]).confidence,b.constraints.get(constraints[0]).confidence):0,customer:customers.length?5:0,milestone:milestones.length?5:0};
 const score=Object.values(components).reduce((x,y)=>x+y,0);if(score<23)return null;
 const why=problem?'Inferred problem overlap: '+problem.a.rule.name:workflow&&uses.length?'Connected workflow: '+workflow.a.rule.name+' → '+workflow.b.rule.name:'Related funded-work terms: '+lex.shared.slice(0,4).join(', ');
 const firstUseA=a.uses.keys().next().value,firstUseB=b.uses.keys().next().value;
 const targetDifference=targetDifferences.length>0;
 let difference=targetDifference?'Stated targets: '+targetDifferences[0]:workflow&&!problem?'Different steps: '+workflow.a.rule.name+' vs '+workflow.b.rule.name:differentUses?'Stated uses: '+firstUseA+' vs '+firstUseB:left&&right&&left!==right?'Approaches: '+left+' vs '+right:!left||!right?'Approach details are incomplete in one or both records':constraints.length?'Shared operating requirement: '+constraints[0]:customers.length?'Shared stated audience: '+customers[0]:milestones.length?'Shared proposed milestone: '+milestones[0]:'No distinguishing detail established by these rules';
 let takeaway=targetDifference?'Compare validation for '+targetDifferences[0]+'.':workflow&&!problem?'Check whether these workflow steps operate in a compatible setting.':differentUses?'Check whether testing requirements transfer between these uses.':left&&right&&left!==right?'Compare testing requirements and operating conditions across approaches.':constraints.length?'Compare how each project tests '+constraints[0].toLowerCase()+'.':problem&&uses.length?'Compare validation plans for the shared problem and application.':uses.length?'Check whether the projects serve the same buyer and workflow.':problem?'Confirm the intended application before treating this as a close peer.':specificMethods.length?'Check whether the shared capability transfers to your application.':'Confirm a shared outcome; title words alone do not establish a close peer.';

 const family=problem?targetFamily(problem.id):null;const targetEvidence=profile=>family?[...(profile.targets.get(family)||[])].map(([name,e])=>name+': '+e.quote):[];
 const evidence={targetsA:targetEvidence(a),targetsB:targetEvidence(b),problemA:problem?.a.quote||workflow?.a.quote||a.title,problemB:problem?.b.quote||workflow?.b.quote||b.title,methodA:left?methodA.get(left)?.quote:undefined,methodB:right?methodB.get(right)?.quote:undefined};
 return {kind:'main',tag,problem:problem?.a.rule.name||'Related funded-work focus',use:uses[0]||'Not established in both records',leftMethod:left||'Approach unclear',rightMethod:right||'Approach unclear',score,components,concepts:problem?[problem.a.rule.name]:workflow?[workflow.a.rule.name,workflow.b.rule.name]:lex.shared.slice(0,4),terms:lex.shared.slice(0,4),constraints,customers,milestones,evidence,why,difference,connection,takeaway,settingA:firstUseA||'Not established',settingB:firstUseB||'Not established',comparisonBasis:problem?'Recognized problem':workflow&&uses.length?'Recognized workflow':uses.length?'Recognized application':'Specific title terms'};
}

/* Open-vocabulary retrieval: weighted title and proposed-work phrases.
   No API, model service, or inferred competitor claim. Every shared feature retains source excerpts. */
const SEARCH_STOP=new Set([...TITLE_STOP,...('a an as at be been being by does during each either has have had having if in is it its may of on or our over per such than that their these they this those to under was were what when where which while who why will would within without we you your us also are can could shall should must both many most several other others across among amongs all any into about between than therefore however thus furthermore additionally additional overall wide range year years assembly strategy conduct conducted conducting complementary further continued anticipated prospective expected importantly subsequent previously substantially substantially promising successful successfully respectively include way ways approach beyond following current currently future two three four five one another including significant significantly preliminary promising feasible feasibility phase project objective objectives aims aim goal goals task tasks proposed propose proposal proposals broader impact impacts potential commercialization commercialize market commercialization products product improve improving improvement improvements improves improved performance novel new innovative innovation innovations method methods technology technologies technological tool tools platform platforms system systems solution solutions approach approaches development developed developing develop develops demonstrate demonstration demonstrated demonstrate demonstrates testing test tests tested evaluate evaluation evaluations validated validate validation study studies studies research researcher researchers program programs award awards support supports supported funded funding federal government foundation national science nsf nih nist dod nasa sbir sttr department university company companies incorporated inc llc corp corporation abstract summary technical application applications use uses used using enable enables enabled enabling provide provides provided providing allow allows achieve achieving achieved need needs needed address addressing challenge challenges benefit benefits opportunities opportunity important including include includes intended respective respectively'.split(/\s+/))]);
const SEARCH_GENERIC=new Set([...TITLE_NONANCHOR,...('automate automated automating automation interpretation interpret processing process analysis analyze analytical algorithm algorithms modeling model models control controlled quality standard standardized consistent consistency accuracy accurate precise precision rapid real time realtime high throughput throughput efficient efficiency low cost costs affordable scalable scale scaling robust reliability reliable sensitivity sensitive detection detect detects detect diagnostic diagnostics diagnosis diagnose monitoring monitor monitors sensing sensor sensors device devices measurement measure measurements testing test research development validation clinic clinical patient patients tissue tissues cell cells biological biology engineering prototype prototypes optimization optimize optimized improvement evaluation management manufacturing manufacture produce production material materials molecule molecular small experimental experimentation based enabled enable advanced advanced industrial industry field deployment deployed deploy function functional human health new generic another digital minimally invasive non toxic signal speed mass rate rates size large small new generic another computer vision neurostimulation stimulation neural nerve stimulator microfluidic microfluidics spectroscopy spectrometry sequencing fluorescence tomography microscopy holographic'.split(/\s+/))]);
const SEARCH_CANON={...TITLE_CANON,
 diagnoses:'diagnostic',diagnosing:'diagnostic',diagnosis:'diagnostic',diagnostics:'diagnostic',diagnostic:'diagnostic',
 detection:'detect',detecting:'detect',detected:'detect',monitoring:'monitor',monitored:'monitor',
 sensing:'sensor',sensors:'sensor',images:'image',imaging:'image',image:'image',
 analysis:'analysis',analyzing:'analysis',analysing:'analysis',analyzer:'analysis',analyser:'analysis',analytical:'analysis',
 interpretation:'interpretation',interpreting:'interpretation',interprets:'interpretation',interpret:'interpretation',
 automated:'automate',automation:'automate',automating:'automate',
 fluorescent:'fluorescence',fluorometric:'fluorescence',holography:'holographic',microscopic:'microscopy',microscope:'microscopy',
 nervous:'neural',neurogenic:'neural',sensations:'sensory',sensation:'sensory',restoration:'restore',restoring:'restore',restores:'restore',neuroprosthetic:'neuroprosthesis',neuroprosthetics:'neuroprosthesis',neurological:'neural',neuronal:'neural',neurons:'neural',neurologic:'neural',
 neuromodulation:'neurostimulation',neuromodulatory:'neurostimulation',neurostimulation:'neurostimulation',
 orthopedic:'orthopedic',orthopaedic:'orthopedic',orthopedics:'orthopedic',orthopaedics:'orthopedic',
 therapeutics:'therapy',therapeutic:'therapy',therapies:'therapy',treatment:'therapy',treatments:'therapy',treating:'therapy',
 contaminants:'contaminant',contamination:'contaminant',contaminated:'contaminant',
 wastewater:'wastewater',sewage:'wastewater',desalination:'desalination',desalinization:'desalination',
 nitrate:'nitrate',nitrates:'nitrate',bacterial:'bacteria',bacterium:'bacteria',
 photovoltaics:'photovoltaic',photovoltaic:'photovoltaic',perovskites:'perovskite',
 defects:'defect',defective:'defect',wafers:'wafer',chiplets:'chiplet',semiconductors:'semiconductor',
 fractures:'fracture',bones:'bone',implants:'implant',implantable:'implant',
 batteries:'battery',electrolytes:'electrolyte',lithiumion:'lithium-ion',
 pathogens:'pathogen',pathogenic:'pathogen',viruses:'virus',viral:'virus',cancers:'cancer',tumours:'tumor',
 intrusion:'intrusion',intrusions:'intrusion',vulnerabilities:'vulnerability',
 fertilizers:'fertilizer',fertilisers:'fertilizer',fertiliser:'fertilizer',
 satellite:'satellite',satellites:'satellite',spacecrafts:'spacecraft',
 cooling:'cooling',cooled:'cooling',coatings:'coating',coated:'coating'
};
const SEARCH_ALIASES=[
 ['bladder dysfunction',/urinary incontinence|bladder dysfunction|neurogenic bladder|urinary continence/i,true],
 ['spinal cord injury',/spinal.cord injur|spinal injur/i,true],
 ['nerve stimulation',/neurostimulat|neuromodulat|neural stimulat|nerve stimulat/i,false],
 ['gram stain',/gram.stain/i,true],
 ['holographic microscopy',/holograph(?:ic|y).{0,30}microscop|digital holograph/i,false],
 ['point of care',/point.of.care|point.of.use/i,false],
 ['semiconductor wafer',/semiconductor wafer|wafer.{0,25}(?:defect|inspect|metrolog)/i,true],
 ['additive manufacturing',/additive manufactur|3.?d print|three.dimensional print/i,false],
 ['wound healing',/wound heal|wound closure|chronic wound/i,true],
 ['bone fracture',/bone fracture|fracture fixation|fracture stabiliz/i,true],
 ['water nitrate',/nitrat(?:e|es).{0,35}water|water.{0,35}nitrat(?:e|es)/i,true],
 ['pfas chemicals',/\bpfas\b|per.and polyfluoroalkyl/i,true],
 ['carbon dioxide',/carbon dioxide|\bco2\b|co₂/i,true],
 ['gps denied navigation',/gps.denied|gnss.denied|without gps|gps.unavailable/i,true],
 ['lithium ion battery',/lithium.ion batter/i,true],
 ['battery thermal runaway',/thermal runaway|battery fire/i,true],
 ['liquid biopsy',/liquid biops|circulating tumor dna|cell.free tumor dna/i,true],
 ['cancer glioblastoma',/glioblastoma|\bgbm\b/i,true],
 ['antibiotic resistance',/antibiotic resistan|antimicrobial resistan|drug.resistant bacter/i,true],
 ['intrusion detection',/intrusion detect|network threat detect/i,true],
 ['quantum diamond defect',/diamond defect quantum|quantum.{0,35}diamond defect|nitrogen.vacancy center/i,true],
 ['machine learning',/machine learning|deep learning|neural network|artificial intelligence/i,false],
 ['raman spectroscopy',/raman spectroscop|raman.based|swept.source raman/i,false],
 ['reverse osmosis',/reverse osmosis|\bro membrane/i,false],
 ['green hydrogen',/green hydrogen|renewable hydrogen/i,true]
];
let TEXT_DF=new Map(),TEXT_INDEX=new Map(),TEXT_N=0;
const searchIDF=id=>Math.log(1+(TEXT_N||20)/((TEXT_DF.get(id)||0)+1));
function searchWord(word){let w=SEARCH_CANON[word]||word;if(!SEARCH_CANON[word]&&w.length>5&&w.endsWith('s')&&!/ss$|ics$|ous$|sis$|us$/.test(w))w=w.slice(0,-1);return w}
function searchTokens(value){return (String(value||'').toLowerCase().replace(/\bx[‐‑–— -]?ray\b/g,'xray').replace(/[‐‑–—-]/g,' ').match(/[a-z][a-z0-9]{2,}/g)||[]).map(searchWord)}
function projectScope(r){const title=text(r.title),body=sourceParts(r).body;if(/identity verification|authentication|biometric/i.test(title))return 'Identity verification';if(/neural|neurogenic|nervous/i.test(title)&&/restore.{0,80}(?:sens|bodily|body function)|sensory restor/i.test(body))return 'Restoration of neural function';if(/neural|neuroscience|brain organoid/i.test(title+' '+body)&&/research|organoid|neural probe/i.test(title))return 'Neural research tools';return ''}
function lexicalProfile(r){
 const parts=sourceParts(r),features=new Map(),quotes=[parts.title];
 const background=/\b(?:conventional|traditional|previous|prior|existing methods|state.of.the.art|unlike|rather than|instead of|does not rely|do not rely|not rely|not use|avoid using|avoid the use|compared to)\b/i;
 const intent=/\b(?:this (?:project|proposal|research|technology)|our|we|propos\w*|develop\w*|aim\w*|objective\w*|goal\w*|will|uses?|demonstrat\w*|design\w*|engineer\w*)\b/i;
 const candidates=parts.sentences.map(s=>s.trim()).filter(s=>s.length>30&&!background.test(s)&&intent.test(s));
 // Prefer stated work. If the abstract has no explicit intent wording, do not manufacture a purpose from background prose.
 quotes.push(...candidates.slice(0,7));
 const add=(id,label,quote,prominence,anchor,words)=>{const previous=features.get(id);if(!previous||previous.p<prominence)features.set(id,{id,label,q:quote,p:prominence,anchor,words});};
 for(let qi=0;qi<quotes.length;qi++){const q=quotes[qi],prominence=qi===0?3:qi<=3?1.7:1,words=searchTokens(q);
  for(let wi=0;wi<words.length;wi++){const w=words[wi];if(SEARCH_STOP.has(w)||w.length<3||wi>0&&/^(?:non|not|without)$/.test(words[wi-1]))continue;add('w:'+w,w,q,prominence,!SEARCH_GENERIC.has(w),[w]);}
  for(let i=0;i<words.length-1;i++){const a=words[i],b=words[i+1];if(SEARCH_STOP.has(a)||SEARCH_STOP.has(b)||a===b)continue;const qualifier=i>0&&/^(?:non|not|without)$/.test(words[i-1])?words[i-1]+'-':'';const anchors=[a,b].filter(w=>!SEARCH_GENERIC.has(w));add('p:'+qualifier+a+' '+b,qualifier+a+' '+b,q,prominence*1.15,anchors.length>0,anchors);}
  for(const [label,re,anchor]of SEARCH_ALIASES){if(re.test(q))add('c:'+label,label,q,prominence*1.3,anchor,anchor?label.split(' ').filter(w=>!SEARCH_GENERIC.has(w)):[]);}
 }
 return {features,quotes,titleTerms:new Set(searchTokens(parts.title).filter(w=>!SEARCH_STOP.has(w)&&!SEARCH_GENERIC.has(w))),norm:0};
}
function indexTextSearch(){TEXT_N=MATCH_ROWS.size;TEXT_DF=new Map();TEXT_INDEX=new Map();
 for(const p of MATCH_PROFILE.values())for(const id of p.lex.features.keys())TEXT_DF.set(id,(TEXT_DF.get(id)||0)+1);
 for(const [id,p]of MATCH_PROFILE){const chosen=[...p.lex.features].filter(([feature])=>(TEXT_DF.get(feature)||0)<=Math.max(5,TEXT_N*.65)).sort((a,b)=>b[1].p*searchIDF(b[0])-a[1].p*searchIDF(a[0])).slice(0,120);p.lex.features=new Map(chosen);p.lex.norm=Math.sqrt(chosen.reduce((sum,[feature,e])=>sum+(e.p*searchIDF(feature))**2,0))||1;
  for(const [feature]of chosen){if(!TEXT_INDEX.has(feature))TEXT_INDEX.set(feature,[]);TEXT_INDEX.get(feature).push(id)}
 }
}
function textOverlap(a,b){
 const common=[];let dot=0;for(const [id,x]of a.lex.features){const y=b.lex.features.get(id);if(!y)continue;const idf=searchIDF(id),weight=idf*idf*x.p*y.p;dot+=weight;common.push({id,x,y,weight})}
 common.sort((x,y)=>y.weight-x.weight);
 const norm=p=>p.lex.norm||Math.sqrt([...p.lex.features].reduce((sum,[id,e])=>sum+(searchIDF(id)*e.p)**2,0))||1;
 const similarity=dot/(norm(a)*norm(b)),anchors=new Set(common.filter(x=>x.x.anchor&&x.y.anchor).flatMap(x=>x.x.words));
 const titleA=[...anchors].filter(x=>a.lex.titleTerms.has(x)),titleB=[...anchors].filter(x=>b.lex.titleTerms.has(x));
 const phrases=common.filter(x=>x.x.anchor&&x.y.anchor&&x.id.startsWith('p:'));
 const aliases=common.filter(x=>x.x.anchor&&x.y.anchor&&x.id.startsWith('c:'));
 const headEvidence=titleA.length>0&&titleB.length>0;
 const preciseTitlePhrase=phrases.some(item=>item.x.words.length>=2&&item.x.p>=3&&item.y.p>=3);
 const supported=anchors.size>=2&&(phrases.length>0||aliases.length>0||headEvidence)&&(similarity>=.065||preciseTitlePhrase&&similarity>=.04)&&(titleA.length+titleB.length>0||anchors.size>=4&&similarity>=.16);
 const sourceQuote=side=>{const totals=new Map();for(const item of common.filter(x=>x.x.anchor&&x.y.anchor)){const quote=item[side].q;totals.set(quote,(totals.get(quote)||0)+item.weight)}return [...totals].sort((a,b)=>b[1]-a[1])[0]?.[0]};
 // Prefer exact meaningful phrases, then narrow synonym concepts, then individual terms. Never call these verified semantic equivalence.
 const explanatory=[...phrases,...aliases,...common.filter(x=>x.id.startsWith('w:')&&x.x.anchor&&x.y.anchor)];
 const terms=[];for(const item of explanatory){const label=item.x.label;if(terms.some(t=>t.includes(label)))continue;terms.push(label);if(terms.length===4)break}
 const coverage=Math.min(1,anchors.size/6),score=18+40*Math.min(1,similarity)+10*coverage+(phrases.length?6:0)+(headEvidence?6:0);
 return {supported,similarity,score,terms,anchors:[...anchors],quoteA:explanatory[0]?.x.q||sourceQuote('x'),quoteB:explanatory[0]?.y.q||sourceQuote('y'),headEvidence,common};
}
function indexMatching(list){indexStructuredMatching(list);indexTextSearch()}
function titleContrast(a,b){const left=[...a.lex.titleTerms].filter(w=>!b.lex.titleTerms.has(w)).slice(0,3),right=[...b.lex.titleTerms].filter(w=>!a.lex.titleTerms.has(w)).slice(0,3);return left.length&&right.length?'Title focus: '+left.join(' · ')+' vs '+right.join(' · '):'No further distinction classified; review the source excerpts'}
function relationFor(a,b){
 if(a.educationPurpose!==b.educationPurpose)return null;
 if((a.scope==='Identity verification'&&b.scope==='Restoration of neural function')||(b.scope==='Identity verification'&&a.scope==='Restoration of neural function'))return null;
 const quantumMismatch=(a.problems.has('wafer-inspection')&&/diamond defect quantum|defect quantum systems/i.test(b.title)&&!/wafer|semiconductor manufactur/i.test(b.title))||(b.problems.has('wafer-inspection')&&/diamond defect quantum|defect quantum systems/i.test(a.title)&&!/wafer|semiconductor manufactur/i.test(a.title));if(quantumMismatch)return null;
 const original=structuredRelationFor(a,b),overlap=textOverlap(a,b);
 const structured=original&&original.comparisonBasis!=='Specific title terms';
 const capabilityMethods=commonKeys(a.methods,b.methods).filter(m=>m!=='Machine-learning model'),capabilityUses=commonKeys(a.uses,b.uses);
 const capability=capabilityMethods.length>0&&capabilityUses.length>0;
 if(!structured&&!overlap.supported&&!capability)return null;
 if(original&&structured){return {...original,score:original.score+(overlap.supported?Math.min(12,overlap.similarity*22):0),textTerms:overlap.supported?overlap.terms:[],textSimilarity:overlap.similarity,searchEvidence:overlap.supported?{quoteA:overlap.quoteA,quoteB:overlap.quoteB,terms:overlap.terms}:null}}
 const methodA=taskMethods(a,''),methodB=taskMethods(b,''),sharedMethod=commonKeys(methodA,methodB).find(m=>m!=='Machine-learning model'),left=sharedMethod||methodA.keys().next().value,right=sharedMethod||methodB.keys().next().value;
 const uses=commonKeys(a.uses,b.uses),targetDifferences=[];for(const family of TARGET_RULES?Object.keys(TARGET_RULES):[]){const x=a.targets.get(family),y=b.targets.get(family);if(x?.size&&y?.size&&!commonKeys(x,y).length)targetDifferences.push([...x.keys()].join(', ')+' vs '+[...y.keys()].join(', '))}
 const oppositeKnownTargets=targetDifferences.length>0;
 const tag=capability&&!overlap.supported?'Shared method':uses.length?'Application overlap':sharedMethod?'Shared method':'Project similarity';
 const connection=capability&&!overlap.supported?'Shared method: '+capabilityMethods[0]+' · '+capabilityUses[0]:'Shared project concepts: '+overlap.terms.slice(0,3).join(' · ');
 const settingA=a.uses.keys().next().value||'Not classified',settingB=b.uses.keys().next().value||'Not classified';
 const difference=oppositeKnownTargets?'Stated targets: '+targetDifferences[0]:settingA!=='Not classified'&&settingB!=='Not classified'&&settingA!==settingB?'Stated uses: '+settingA+' vs '+settingB:left&&right&&left!==right?'Approaches: '+left+' vs '+right:a.scope&&b.scope&&a.scope!==b.scope?'Project purposes: '+a.scope+' vs '+b.scope:titleContrast(a,b);
 const evidence={problemA:overlap.quoteA||a.uses.get(capabilityUses[0])?.quote||a.title,problemB:overlap.quoteB||b.uses.get(capabilityUses[0])?.quote||b.title,methodA:left?methodA.get(left)?.quote:undefined,methodB:right?methodB.get(right)?.quote:undefined,targetsA:[],targetsB:[]};
 return {kind:'main',tag,problem:'Project-description similarity',use:uses[0]||'Not established in both records',leftMethod:left||'Approach unclear',rightMethod:right||'Approach unclear',score:(capability&&!overlap.supported?38:overlap.score)*(oppositeKnownTargets?.65:1)*(a.scope&&b.scope&&a.scope!==b.scope?.8:1),components:{text:overlap.score},concepts:overlap.terms.length?overlap.terms:capabilityMethods,terms:overlap.terms,textTerms:overlap.supported?overlap.terms:[],constraints:commonKeys(a.constraints,b.constraints),customers:commonKeys(a.customers,b.customers),milestones:[],evidence,why:connection,difference,connection,takeaway:'Compare the stated project goals and validation requirements.',settingA,settingB,comparisonBasis:capability&&!overlap.supported?'Shared classified method and named application':'Weighted title and proposed-work abstract search',textSimilarity:overlap.similarity,searchEvidence:overlap.supported?{quoteA:overlap.quoteA,quoteB:overlap.quoteB,terms:overlap.terms}:null};
}
function relatedFor(r){
 const cacheKey=r.id,companyKey=key(r);if(MATCH_CACHE.has(cacheKey))return MATCH_CACHE.get(cacheKey);const a=MATCH_PROFILE.get(r.id);if(!a)return {main:[],discovery:[],focusCount:0};const candidates=new Map();
 const add=(set,boost)=>{for(const id of set||[])candidates.set(id,(candidates.get(id)||0)+boost)};
 for(const problem of a.problems.keys())add(MATCH_PROBLEM_INDEX.get(problem),12);
 for(const use of a.uses.keys())add(USE_INDEX.get(use),8);
 for(const method of a.methods.keys())if(method!=='Machine-learning model')add(MATCH_METHOD_INDEX.get(method),3);
 for(const [x,y]of COMPLEMENT_PAIRS){if(a.problems.has(x))add(MATCH_PROBLEM_INDEX.get(y),5);if(a.problems.has(y))add(MATCH_PROBLEM_INDEX.get(x),5)}
 const query=[...a.lex.features].filter(([id,e])=>e.anchor&&(TEXT_DF.get(id)||0)<Math.max(5,TEXT_N*.25)).sort((x,y)=>y[1].p*searchIDF(y[0])-x[1].p*searchIDF(x[0])).slice(0,24);
 for(const [feature,e]of query)add(TEXT_INDEX.get(feature),searchIDF(feature)*Math.min(3,e.p));
 const ranked=new Map();for(const [id]of [...candidates].sort((a,b)=>b[1]-a[1]).slice(0,600)){
  const other=MATCH_ROWS.get(id);if(!other||key(other)===companyKey)continue;const relation=relationFor(a,MATCH_PROFILE.get(id));if(!relation)continue;const match={...relation,r:other,focus:r};const previous=ranked.get(key(other));if(!previous||match.score>previous.score)ranked.set(key(other),match)
 }
 const main=[...ranked.values()].sort((a,b)=>b.score-a.score||date(b.r.date)-date(a.r.date)).slice(0,5),result={main,discovery:[],focusCount:1};MATCH_CACHE.set(cacheKey,result);return result;
}
