const fs=require('fs'),vm=require('vm'),assert=require('assert'),path=require('path');
const context={Map,Set,Date,text:s=>String(s||'').replace(/\s+/g,' ').trim(),key:r=>r.companyKey,date:s=>Date.parse(s)||0};vm.createContext(context);vm.runInContext(fs.readFileSync(path.join(__dirname,'matching.js'),'utf8'),context);
const profile=title=>{context.r={title,abstractText:''};return vm.runInContext('profileOf(r)',context)};
const relation=(a,b)=>{context.a=profile(a);context.b=profile(b);return vm.runInContext('relationFor(a,b)',context)};
let p=relation('Optical interferometry for detection of semiconductor wafer defects','Acoustic sensing for detection of semiconductor wafer defects');assert.equal(p.tag,'Different approaches');assert(p.components.problem>=p.components.useCase);assert.equal(p.components.customer,0);assert.equal(p.components.milestone,0);
p=relation('Optical interferometry for detection of semiconductor wafer defects','Optical interferometry for inspection of wafer defects');assert.equal(p.tag,'Problem overlap');
assert.equal(relation('Optical interferometry for detection of semiconductor wafer defects','Optical interferometry for monitoring retinal disease'),null);
p=relation('Optical spectroscopy for detection of water contaminants in drinking water','Membrane filtration for removal of water contaminants in drinking water');assert.equal(p.tag,'Workflow connection');assert.equal(p.kind,'main');
assert.equal(relation('Optical interferometry for generic research','Optical interferometry for another research project'),null);
assert.equal(relation('Raman spectroscopy for detection of coastal water contaminants','Raman spectroscopy for detection of drinking water contaminants').kind,'main');
assert.equal(relation('Detection of semiconductor wafer defects','Inspection of semiconductor wafer defects').tag,'Problem overlap'); // Approach is unknown, not an invented alternative.
assert.notEqual(relation('PCR amplification for detection of breast cancer','PCR amplification for detection of lung cancer')?.tag,'Problem overlap');
context.r={title:'Detection of semiconductor wafer defects',abstractText:'Traditional methods use optical interferometry. Our project will develop a prototype.'};assert.equal(vm.runInContext('profileOf(r).methods.size',context),0);
context.r={title:'Diamond defect quantum systems for RF sensing',abstractText:'Our project develops measurement and control of diamond defect quantum systems. The semiconductor manufacturing industry is a potential future market.'};assert.equal(vm.runInContext("profileOf(r).problems.has('wafer-inspection')",context),false);
context.r={title:'Microbiome biomarkers for gestational diabetes diagnosis',abstractText:'Our previous study has identified five bacteria predictive of gestational diabetes. This project will develop a diabetes diagnostic.'};assert.equal(vm.runInContext("profileOf(r).problems.has('pathogen-detection')",context),false);
p=relation('Polymer sleeve and machine learning for bone fracture fixation','Fixation screws and machine learning for bone fracture stabilization');assert.equal(p.tag,'Different approaches');assert.equal(p.leftMethod,'Polymer-based implant');assert.equal(p.rightMethod,'Mechanical fixation');
assert.equal(relation('Machine learning for blood-based cancer detection','Machine learning for detection of drinking water contaminants'),null);
p=relation('Polymer sleeve for bone fracture fixation','Personalized postoperative management using sensorized bone plates for traumatic fractures');assert.equal(p.tag,'Workflow connection');assert.equal(p.kind,'main');
context.list=[{id:'a',companyKey:'one',title:'Optical interferometry for detection of semiconductor wafer defects',date:'2026-01-01'},{id:'b',companyKey:'one',title:'Acoustic sensing for detection of semiconductor wafer defects',date:'2026-02-01'},{id:'c',companyKey:'two',title:'Acoustic sensing for detection of semiconductor wafer defects',date:'2026-03-01'}];vm.runInContext('indexMatching(list)',context);p=vm.runInContext('relatedFor(list[0])',context);assert.equal(p.main.length,1);assert.equal(p.main[0].r.companyKey,'two');
assert.equal(vm.runInContext('Object.values(MATCH_WEIGHTS).reduce((a,b)=>a+b,0)',context),100);
console.log('PASS unified ranking: problem-first ranking, unknown methods, unified relationship types, generic-method exclusion, target differences, source evidence, distinct companies, and weights totaling 100.');

// Evidence labels and takeaways remain useful even when methods are missing.
p=relation('Detection of semiconductor wafer defects','Inspection of semiconductor wafer defects');assert.equal(p.tag,'Problem overlap');assert(p.connection.includes('wafer'));assert(p.difference.includes('incomplete'));assert(p.takeaway.includes('validation'));assert(p.evidence.problemA);assert(p.evidence.problemB);
p=relation('Optical interferometry for detection of semiconductor wafer defects','Acoustic sensing for detection of semiconductor wafer defects');assert(p.difference.includes('Optical interferometry'));assert(p.difference.includes('Acoustic sensing'));assert(p.takeaway.includes('Compare'));
p=relation('Raman spectroscopy for detection of coastal water contaminants','Raman spectroscopy for detection of drinking water contaminants');assert(p.difference.includes('Coastal'));assert(p.takeaway.includes('transfer'));
// Distinct companies remain capped at five; close problem/use matches beat cross-use leads.
context.list=[{id:'f',companyKey:'focus',title:'Raman spectroscopy for detection of coastal water contaminants',date:'2026-01-01'},...Array.from({length:8},(_,i)=>({id:'c'+i,companyKey:'company'+i,title:i<3?'Raman spectroscopy for detection of coastal water contaminants':'Raman spectroscopy for detection of drinking water contaminants',date:'2026-01-01'}))];vm.runInContext('indexMatching(list)',context);p=vm.runInContext('relatedFor(list[0])',context);assert.equal(p.main.length,5);assert(p.main.slice(0,3).every(x=>x.r.title.includes('coastal')));assert(p.main.every(x=>x.connection&&x.takeaway&&x.evidence.problemA&&x.evidence.problemB));assert.equal(new Set(p.main.map(x=>x.r.companyKey)).size,5);
console.log('PASS actionable leads: meaningful labels, concrete distinctions, evidence gaps, exploration questions, close-use ranking and top-five deduplication.');

// Main stated outcome must not become a secondary supporting measurement task.
context.r={title:'Lightweight Portable Water Purification Systems for Military Field Operations',abstractText:'Our project will monitor water quality and detect water contaminants during purification.'};assert.equal(vm.runInContext("profileOf(r).problems.has('water-detection')",context),false);assert.equal(vm.runInContext("profileOf(r).problems.has('water-removal')",context),true);

// Background comparisons must never become proposed-method claims.
context.r={title:'Detection of PFAS in Drinking Water',abstractText:'Compared to the state-of-the-art, the proposed process does not rely on liquid chromatography-mass spectrometry. This project will use a fluoride ion detector.'};assert.equal(vm.runInContext("profileOf(r).methods.has('Mass spectrometry')",context),false);assert.equal(vm.runInContext("profileOf(r).methods.has('Fluoride-ion detection')",context),true);
context.r={title:'A remote sensor for groundwater remediation monitoring',abstractText:'The goal of this project is to develop sensors and improve drinking water standards.'};assert.equal(vm.runInContext("profileOf(r).uses.has('Groundwater remediation')",context),true);assert.equal(vm.runInContext("profileOf(r).uses.has('Drinking-water management')",context),false);

// Actual source regressions: these records caused misleading production-preview labels.
const actual=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures/water-projects.json'),'utf8')).records;context.actual=actual;vm.runInContext('indexMatching(actual)',context);
const get=name=>{context.item=actual.find(r=>r.awardeeName===name);return vm.runInContext('MATCH_PROFILE.get(item.id)',context)};
let wai=get('WAIHOME LLC');assert(wai.problems.has('water-disposal'));assert(!wai.problems.has('water-detection'));assert(!wai.problems.has('water-removal'));
let exergy=get('EXERGY SYSTEMS, INC.');assert(exergy.problems.has('water-removal'));assert(!exergy.problems.has('water-detection'));
let qb=get('QUANTITATIVE BIOSCIENCES, INC.');assert(qb.uses.has('Groundwater remediation'));assert(!qb.uses.has('Drinking-water management'));
let fram=get('FRAMERGY INC');assert(!fram.methods.has('Mass spectrometry'));assert(fram.methods.has('Fluoride-ion detection'));
context.a=get('DOTTIR LABS, INC');context.b=wai;p=vm.runInContext('relationFor(a,b)',context);if(p){assert.equal(p.tag,'Shared setting');assert(!p.why.includes('Shared problem'));}
context.b=qb;p=vm.runInContext('relationFor(a,b)',context);assert(p.difference.includes('Metal contaminants'));
assert(!fs.readFileSync(path.join(__dirname,'dashboard.js'),'utf8').includes('Relationship unclear'));
console.log('PASS audited source regressions: wastewater disposal, water purification, groundwater setting, target differences, and negated mass spectrometry.');

context.a=get('DOTTIR LABS, INC');context.b=get('PAGE Technologies, Inc');const near=vm.runInContext('relationFor(a,b)',context);context.b=get('FRAMERGY INC');const far=vm.runInContext('relationFor(a,b)',context);assert(near.components.problem>far.components.problem);context.focal=actual[0];const ranked=vm.runInContext('relatedFor(focal)',context);assert.equal(ranked.main[0].r.awardeeName,'PAGE Technologies, Inc');
console.log('PASS target relevance: nutrient monitoring outranks different-target water detection in the audited fixture set.');

// The screen project anchors all results; switching projects cannot reuse another project's cached ranking.
context.list=[{id:'fa',companyKey:'same',title:'Optical interferometry for detection of semiconductor wafer defects',date:'2026-01-01'},{id:'fb',companyKey:'same',title:'PCR amplification for clinical pathogen detection of sepsis',date:'2026-02-01'},{id:'w',companyKey:'wafer',title:'Acoustic sensing for detection of semiconductor wafer defects',date:'2026-01-01'},{id:'s',companyKey:'sepsis',title:'PCR amplification for clinical pathogen detection of sepsis',date:'2026-01-01'}];vm.runInContext('indexMatching(list)',context);p=vm.runInContext('relatedFor(list[0])',context);assert(p.main.every(x=>x.focus.id==='fa'));assert(p.main.some(x=>x.r.id==='w'));assert(!p.main.some(x=>x.r.id==='s'));p=vm.runInContext('relatedFor(list[1])',context);assert(p.main.every(x=>x.focus.id==='fb'));assert(p.main.some(x=>x.r.id==='s'));assert(!p.main.some(x=>x.r.id==='w'));
console.log('PASS project anchoring: selected-project evidence, no cross-project cache leakage, same-company exclusion.');

// Teaching a technology is not equivalent to developing it.
context.a=profile('Optical Raman Sensor Network for Persistent Coastal Water Quality Monitoring');context.b=profile('Flu Finders: Data Literacy through Wastewater Monitoring');assert.equal(vm.runInContext('relationFor(a,b)',context),null);vm.runInContext('indexMatching(actual)',context);context.a=get('DOTTIR LABS, INC');context.r=actual.find(r=>r.title.includes('Flu Finders'));context.b=vm.runInContext('profileOf(r)',context);assert.equal(vm.runInContext('relationFor(a,b)',context),null);
console.log('PASS primary-purpose exclusion: educational content does not qualify as a water-sensor developer.');

// Open-vocabulary matching must work beyond the hand-written problem catalog.
context.list=[
 {id:'rail-a',companyKey:'rail-a',title:'Adaptive mobile inspection',abstractText:'This project will develop rail wheel crack inspection and axle fatigue monitoring using acoustic sensing.',date:'2025-01-01'},
 {id:'rail-b',companyKey:'rail-b',title:'Automated railway inspection platform',abstractText:'Our proposed system will detect axle fatigue and rail wheel cracks using optical inspection.',date:'2025-01-01'},
 {id:'wrong-a',companyKey:'wrong-a',title:'Automated signal interpretation',abstractText:'This project will develop acoustic quality control for aircraft engine inspection.',date:'2025-01-01'}
];vm.runInContext('indexMatching(list)',context);p=vm.runInContext('relatedFor(list[0])',context);assert(p.main.some(x=>x.r.id==='rail-b'));let rail=p.main.find(x=>x.r.id==='rail-b');assert(rail.searchEvidence);assert(rail.searchEvidence.quoteA.includes('rail wheel'));assert(rail.searchEvidence.quoteB.includes('rail wheel'));assert(!p.main.some(x=>x.r.id==='wrong-a'));
// Narrow synonym expansion is accompanied by actual source excerpts.
p=relation('Implant for urinary incontinence control','Implant for neurogenic bladder dysfunction');assert(p);assert(p.evidence.problemA.includes('urinary'));assert(p.evidence.problemB.includes('bladder'));
// Generic automation / AI / interpretation cannot by itself make unrelated firms comparable.
assert.equal(relation('Automated Gram Stain Interpretation Via Digital Holographic Microscopy','AI-Enabled Acoustic Signal Interpretation for Automated Quality Control Testing'),null);
assert.equal(relation('Computer vision for merchandising forest products','Computer vision for aircraft security'),null);
assert.equal(relation('Minimally Invasive Orthopedic Fracture Fixation','Minimally Invasive Local Delivery of Cardiac Gene Therapy'),null);
// Terms from rejected/background approaches are not used to create a text match.
context.a=profile('Antenna calibration');context.a.lex=vm.runInContext("lexicalProfile({title:'Antenna calibration',abstractText:'Traditional methods use cancer pathology imaging. Our project will develop radio antenna calibration.'})",context);context.b=profile('Cancer pathology imaging');assert.equal(vm.runInContext('relationFor(a,b)',context),null);
// Purpose errors identified in the source audit must not survive through the structured rules.
context.r={title:'Drug Delivery for Neuroprotection and Repair in Brain Injuries from Open Skull Fractures',abstractText:'This project will develop a drug delivery system for neural repair after traumatic brain injury.'};assert.equal(vm.runInContext("profileOf(r).problems.has('fracture-fixation')",context),false);
context.r={title:'Low-Cost High-Efficiency X-ray Imaging Panels for Field Radiography',abstractText:'We will develop high-efficiency DR panels using a perovskite semiconductor.'};assert.equal(vm.runInContext("profileOf(r).problems.has('solar-efficiency')",context),false);
context.r={title:'High Detectivity Infrared Detector Array Using Wafer-Bonded Detector Technology',abstractText:'Our project will develop a wafer-bonded infrared detector array.'};assert.equal(vm.runInContext("profileOf(r).problems.has('wafer-inspection')",context),false);
console.log('PASS broader retrieval: abstract-only overlap, narrow synonyms, quoted evidence, no generic-method filler, and primary-purpose exclusions.');

context.a=vm.runInContext("profileOf({title:'Implantable neural interface for neurogenic control',abstractText:'This project will restore sensory awareness of bodily functions.'})",context);context.b=profile('Continuous Identity Verification via Wearable Neural Interfaces');assert.equal(vm.runInContext('relationFor(a,b)',context),null);

// Source-backed cross-industry examples, including formerly empty company views.
const comparableActual=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures/comparable-projects.json'),'utf8')).records;context.comparableActual=comparableActual;vm.runInContext('indexMatching(comparableActual)',context);
const actualRelation=(a,b)=>{context.a=vm.runInContext('MATCH_PROFILE.get(comparableActual.find(r=>r.awardeeName==='+JSON.stringify(a)+').id)',context);context.b=vm.runInContext('MATCH_PROFILE.get(comparableActual.find(r=>r.awardeeName==='+JSON.stringify(b)+').id)',context);return vm.runInContext('relationFor(a,b)',context)};
assert.equal(actualRelation('ECATE LLC','MORPHOSIS INC'),null);
p=actualRelation('ECATE LLC','NEUROBIONICS INC');assert(p);assert(p.evidence.problemA.includes('interface'));assert(p.evidence.problemB.includes('interface'));assert(p.difference.includes('Project purposes'));
assert.equal(actualRelation('Macula Vision Systems Inc.','SIGNAL-WISE LLC'),null);
assert.notEqual(actualRelation('MEDICARBONE, INC.','ALTRAZEAL LIFE SCIENCES INC')?.tag,'Problem overlap');
assert.notEqual(actualRelation('BEYOND SILICON INC','CAPESYM INC')?.tag,'Problem overlap');
assert.notEqual(actualRelation('FRINGE METROLOGY LLC','PRAEVIUM RESEARCH INC')?.tag,'Problem overlap');
p=actualRelation('JUNO PROPULSION INC.','CFD Research Corporation');assert(p?.searchEvidence);assert(p.searchEvidence.terms.some(x=>x.includes('detonation')));
console.log('PASS actual projects: neural-interface capability, propulsion phrases, generic interpretation rejection, and clinical/materials/metrology distinctions.');

// Negating qualifiers must survive shared-phrase labels.
p=relation('Non-toxic propellant for satellite thrusters','Non-toxic propellant loading for satellite thrusters');assert(p);assert(!p.textTerms.includes('toxic propellant'));assert(p.textTerms.some(t=>t.includes('non-toxic'))||p.textTerms.every(t=>!t.includes('toxic')));
