import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const page=await browser.newPage({viewport:{width:1440,height:1000},permissions:['clipboard-read','clipboard-write']});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
const base=process.env.VISUALIZER_URL??'http://localhost:5173/visualizer.html';
async function load(code){
 await page.goto(base);
 await page.waitForFunction(()=>window.online_ide_access?.getIDE('edu_abstract_datatype_visualizer'),{timeout:120000});
 await page.waitForTimeout(2500);
 if(code){await page.locator('.monaco-editor .view-lines').first().click();await page.keyboard.press('Control+A');await page.evaluate(text=>navigator.clipboard.writeText(text),code);await page.keyboard.press('Control+V');}
 await page.waitForTimeout(2500);
 await page.evaluate(()=>{window.snapshots=[];window.online_ide_access.getIDE('edu_abstract_datatype_visualizer').subscribeDebugger(s=>window.snapshots.push(s));});
}
async function step(){
 const count=await page.evaluate(()=>window.snapshots.length);
 await page.locator('.img_step-over-dark.jo_button').click();
 await page.waitForFunction(count=>window.snapshots.length>count&&!window.snapshots.at(-1).event&&['paused','stopped','error'].includes(window.snapshots.at(-1).state),count,{timeout:60000});
}
async function run(limit=50){for(let i=0;i<limit;i++){await step();if(i>2&&(await page.locator('#state').innerText()).startsWith('stopped'))return;}throw Error('Program did not finish');}
async function viewport(){
 return page.locator('#view .react-flow__viewport').evaluate(element=>{
  const m=new DOMMatrixReadOnly(element.style.transform);return [m.m41,m.m42,m.a];
 });
}
async function assertViewport(expected){
 const actual=await viewport();actual.forEach((v,i)=>assert(Math.abs(v-expected[i])<.00001,`Viewport changed: ${expected} -> ${actual}`));
}
async function sourceMarkers(className){
 return page.evaluate(className=>{
  const ide=window.online_ide_access.getIDE('edu_abstract_datatype_visualizer').ide;
  return ide.getCurrentWorkspace().getFiles().flatMap(file=>file.getMonacoModel().getAllDecorations()
   .filter(d=>d.options.className===className).map(d=>({file:file.name,line:d.range.startLineNumber})));
 },className);
}
function objects(s,type){return Object.values(s.heap).filter(o=>o.type===type);}
try{
 await load();
 assert.equal(await page.getByRole('slider',{name:/Animationsgeschwindigkeit/}).count(),0);
 await page.getByRole('button',{name:'Animationsgeschwindigkeit einstellen',exact:true}).click();
 assert.equal(await page.locator('#view #animation-speed').count(),1);
 await page.keyboard.press('Escape');
 assert.equal(await page.getByRole('slider',{name:/Animationsgeschwindigkeit/}).count(),0);
 for(let i=0;i<30;i++){await step();if(await page.locator('#container option').count()===2)break;}
 await page.waitForFunction(()=>document.getElementById('view').textContent.includes('Anna')&&document.getElementById('view').textContent.includes('Ben'));
 await page.waitForTimeout(900);
 if(!(await page.locator('#view').innerText()).includes('Anna'))console.log('DEBUG ANIMATION',await page.locator('body').innerText(),JSON.stringify(await page.evaluate(()=>window.snapshots.at(-1))));
 assert.match(await page.locator('#view').innerText(),/Anna/);assert.match(await page.locator('#view').innerText(),/Ben/);
 if(await page.locator('#container option').count()!==2) console.log('DEBUG MAIN',await page.locator('body').innerText(),JSON.stringify(await page.evaluate(()=>window.snapshots)).slice(-7000));
 assert.equal(await page.locator('#container option').count(),2);
 assert.match(await page.locator('#metrics').innerText(),/Knotenstruktur/);
 await page.locator('#mode').selectOption('internal');assert.match(await page.locator('#view').innerText(),/first/);
 await page.waitForSelector('#view .react-flow__node');
 await page.waitForFunction(()=>document.querySelectorAll('#view .react-flow__edge').length===5);
 assert.equal(await page.locator('#view .react-flow__node').count(),4);
 assert.match(await page.locator('#view').innerText(),/contentObject/);
 assert.match(await page.locator('#view').innerText(),/next/);
 const snapshotBeforeDrag=await page.evaluate(()=>JSON.stringify(window.snapshots.at(-1)));
 const node=page.locator('#view .react-flow__node').first();const box=await node.boundingBox();
 await page.mouse.move(box.x+40,box.y+20);await page.mouse.down();await page.mouse.move(box.x+70,box.y+40,{steps:5});await page.mouse.up();
 assert.equal(await page.evaluate(()=>JSON.stringify(window.snapshots.at(-1))),snapshotBeforeDrag);
 await page.getByRole('button',{name:'Gesamte Struktur anzeigen'}).click();
 await page.screenshot({path:'../docs/prototype.png',fullPage:true});
 // Removing the head leaves current pointing at the detached node in this exact Java implementation.
 const ids=await page.evaluate(()=>{const s=window.snapshots.at(-1);const c=s.heap[s.variables.find(v=>v.name==='namen').value.ref];return {removed:c.fields.first.ref,survivor:s.heap[c.fields.first.ref].fields.next.ref};});
 const position=async id=>page.evaluate(id=>{const element=document.querySelector(`.react-flow__node[data-id="${id}"]`);if(!element)return null;const m=new DOMMatrixReadOnly(element.style.transform);return {x:m.m41,y:m.m42};},id);
 await page.getByRole('button',{name:'Vergrößern',exact:true}).click();
 await page.waitForTimeout(400);
 const cameraBeforeRemoval=await viewport();
 const beforeRemoved=await position(ids.removed),beforeSurvivor=await position(ids.survivor);
 await step();await page.waitForTimeout(160);
 await assertViewport(cameraBeforeRemoval);
 assert((await position(ids.removed)).y>beforeRemoved.y);
 assert((await position(ids.survivor)).x<beforeSurvivor.x);
 await page.waitForTimeout(800);
 await assertViewport(cameraBeforeRemoval);
 assert.match(await page.locator(`#view .react-flow__node[data-id="${ids.removed}"]`).innerText(),/weiterhin referenziert/);
 const pane=await page.locator('#view').boundingBox(),toolbar=await page.getByLabel('Visualisierungsverlauf',{exact:true}).boundingBox();
 assert(Math.abs(pane.height-1000)<2);
 assert(Math.abs(toolbar.width-(pane.width-30))<2);
 const beforeSplit=await page.locator('#ide-pane').boundingBox();
 const separator=page.getByRole('separator',{name:'Breite der Bereiche ändern'}),divider=await separator.boundingBox();
 await page.mouse.move(divider.x+divider.width/2,divider.y+200);await page.mouse.down();
 await page.mouse.move(divider.x-90,divider.y+200,{steps:8});await page.mouse.up();
 assert((await page.locator('#ide-pane').boundingBox()).width<beforeSplit.width-60);
 await separator.focus();await page.keyboard.press('ArrowRight');
 assert((await page.locator('#ide-pane').boundingBox()).width>beforeSplit.width-90);
 const cameraAfterResize=await viewport();
 const runtimeBeforeScrub=await page.evaluate(()=>JSON.stringify(window.snapshots));
 const scrubber=page.getByRole('slider',{name:'Wiedergabeposition',exact:true});
 await scrubber.press('Home');
 assert.match(await page.locator('#state').innerText(),/^history/);
 await scrubber.press('End');
 assert.equal(await page.evaluate(()=>JSON.stringify(window.snapshots)),runtimeBeforeScrub);
 await page.getByRole('button',{name:'Live',exact:true}).click();
 await page.waitForTimeout(100);
 console.log('PASS full-pane toolbar, replay scrubber, mouse and keyboard pane resizing, unchanged interpreter');
 const runtimeBeforeHistory=await page.evaluate(()=>JSON.stringify(window.snapshots));
 const liveSourceMarkers=await sourceMarkers('jo_revealProgramPointer');
 assert.equal((await sourceMarkers('jo_history_line')).length,0);
 await page.getByRole('button',{name:'Vorheriger Schritt',exact:true}).click();
 assert.match(await page.locator('#metrics').innerText(),/Anzahl: 3/);
 assert.match(await page.locator('#state').innerText(),/^history/);
 await page.waitForSelector('.monaco-editor .jo_history_line');
 assert.equal((await sourceMarkers('jo_history_line')).length,1);
 assert.equal((await sourceMarkers('jo_history_line'))[0].line,Number((await page.locator('#state').innerText()).match(/:(\d+)$/)[1]));
 await page.getByRole('button',{name:'Nächster Schritt wiedergeben',exact:true}).click();
 await page.waitForTimeout(850);
 assert.match(await page.locator('#metrics').innerText(),/Anzahl: 2/);
 await page.getByRole('button',{name:'Schritt erneut abspielen',exact:true}).click();
 await page.waitForTimeout(1000);
 assert.match(await page.locator('#metrics').innerText(),/Anzahl: 2/);
 assert.equal(await page.evaluate(()=>JSON.stringify(window.snapshots)),runtimeBeforeHistory);
 await assertViewport(cameraAfterResize);
 await page.getByRole('button',{name:'Live',exact:true}).click();
 assert.deepEqual(await sourceMarkers('jo_history_line'),[]);
 assert.deepEqual(await sourceMarkers('jo_revealProgramPointer'),liveSourceMarkers);
 console.log('PASS recorded history: back, forward animation and replay preserve interpreter state and viewport');
 await step();
 await page.waitForSelector('#view .runtime-node.removed');
 assert.match(await page.locator('#view .runtime-node.removed').innerText(),/vorheriger Zustand/);
 await page.waitForTimeout(850);
 assert.equal(await page.locator(`#view .react-flow__node[data-id="${ids.removed}"]`).count(),0);
 await assertViewport(cameraBeforeRemoval);
 console.log('PASS removal motion with stable zoom and pan: detached node moves down, survivors slide left, unreachable history fades away');
 for(let i=0;i<20;i++){await step();if((await page.locator('#state').innerText()).startsWith('stopped'))break;}
 let snapshots=await page.evaluate(()=>window.snapshots);
 assert(snapshots.some(s=>s.variables.some(v=>v.name==='alias'&&JSON.stringify(v.value)===JSON.stringify(s.variables.find(w=>w.name==='namen')?.value))));
 assert(snapshots.some(s=>Object.values(s.heap).some(o=>o.fields.value==='Benedikt')));
 assert(snapshots.some(s=>s.state==='paused'));assert(snapshots.some(s=>s.state==='stopped'));
 assert(snapshots.some(s=>objects(s,'DynArray').some(o=>o.fields.size===2&&o.fields.current?.ref&&o.fields.first?.ref&&o.fields.current.ref!==o.fields.first.ref&&s.heap[o.fields.current.ref]?.fields.contentObject&&JSON.stringify(s.heap[o.fields.current.ref].fields.contentObject)!==JSON.stringify(s.heap[o.fields.first.ref]?.fields.contentObject))));
 await page.getByRole('button',{name:'Vorheriger Schritt',exact:true}).click();
 assert.match(await page.locator('#state').innerText(),/^history/);
 await page.getByRole('button',{name:'Live',exact:true}).click();
 assert.match(await page.locator('#state').innerText(),/^stopped/);
 console.log('PASS supplied DynArray: insertion, removal, alias, multiple containers, actual storage, states');
 await load(await readFile('../examples/SchulArray.java','utf8'));await run();
 snapshots=await page.evaluate(()=>window.snapshots);
 const arrays=snapshots.flatMap(s=>objects(s,'SchulArray'));
 if(!arrays.length)console.log('DEBUG',await page.locator('body').innerText(),JSON.stringify(snapshots).slice(-3000));
 assert(arrays.some(o=>o.fields.anzahl===1));assert(arrays.some(o=>o.fields.anzahl===7));
 assert(snapshots.some(s=>Object.values(s.heap).some(o=>o.items?.length===4)));
 assert(snapshots.some(s=>Object.values(s.heap).some(o=>o.items?.includes(null))));
 console.log('PASS generic Java container: private fields, capacity growth, null, faulty count');
 await load(await readFile('../examples/Referenzen.java','utf8'));await run();snapshots=await page.evaluate(()=>window.snapshots);
 assert(snapshots.some(s=>objects(s,'Person').some(o=>typeof o.fields.freund==='object'&&o.fields.freund?.ref===o.id)));
 assert(snapshots.some(s=>objects(s,'Array').some(o=>o.items?.length===4&&o.items[0]?.ref&&o.items[0].ref===o.items[1]?.ref)));
 assert(snapshots.some(s=>objects(s,'Person').some(o=>o.fields.name==='Anne'||s.heap[o.fields.name?.ref]?.fields.value==='Anne')));
 console.log('PASS object references: identity, cycles, nested field mutation');
 await load(await readFile('../examples/NullUndIndizes.java','utf8'));await run(80);snapshots=await page.evaluate(()=>window.snapshots);
 const states=snapshots.flatMap(s=>objects(s,'DynArray'));
 assert(states.some(o=>o.fields.size===2&&o.fields.current?.ref===o.fields.last?.ref));
 assert(states.every(o=>typeof o.fields.size!=='number'||o.fields.size<=2));
 assert(states.some(o=>o.fields.size===0&&o.fields.first===null&&o.fields.last===null&&o.fields.current===null));
 assert(snapshots.some(s=>s.state==='stopped'));
 console.log('PASS supplied semantics: null and invalid indices ignored, getItem updates current, deleting all clears references');
 const animationProgram='DynArray<String> items = new DynArray<String>();\nitems.append("A");\nitems.append("B");\nitems.delete(0);\nprintln(items.getLength());';
 for(const reduced of [false,true]){
  await page.emulateMedia({reducedMotion:reduced?'reduce':'no-preference'});
  await load(animationProgram);
  for(let i=0;i<20;i++){await step();if((await page.locator('#state').innerText()).includes('Programm.java:4'))break;}
  await page.waitForTimeout(800);
  const cameraBeforeAbstractRemoval=await viewport();
  await page.getByRole('button',{name:'Animationsgeschwindigkeit einstellen',exact:true}).click();
  const slider=page.getByRole('slider',{name:/Animationsgeschwindigkeit/});
  const snapshotBeforeSpeed=await page.evaluate(()=>JSON.stringify(window.snapshots.at(-1)));
  await slider.press('Home');
  assert.equal(await slider.inputValue(),'0.25');
  assert.match(await page.locator('#animation-speed-value').innerText(),/0,25×.*2,80 s/);
  assert.equal(await page.evaluate(()=>JSON.stringify(window.snapshots.at(-1))),snapshotBeforeSpeed);
  await step();
  if(!reduced){
   await page.waitForSelector('#view .runtime-node.removed');
   await page.waitForTimeout(900);
   assert.equal(await page.locator('#view .runtime-node.removed').count(),1);
   const snapshotDuringMotion=await page.evaluate(()=>JSON.stringify(window.snapshots.at(-1)));
   await page.getByRole('button',{name:'Animationsgeschwindigkeit einstellen',exact:true}).click();
   await slider.press('End');
   assert.equal(await slider.inputValue(),'3');
   assert.match(await page.locator('#animation-speed-value').innerText(),/3×.*0,23 s/);
   await page.waitForTimeout(500);
   assert.equal(await page.evaluate(()=>JSON.stringify(window.snapshots.at(-1))),snapshotDuringMotion);
  } else await page.waitForTimeout(100);
  await assertViewport(cameraBeforeAbstractRemoval);
  assert.equal(await page.locator('#view .runtime-node.removed').count(),0);
  assert.equal(await page.locator('#view .react-flow__node').count(),1);
  assert.match(await page.locator('#view').innerText(),/B/);
 }
 console.log('PASS animation speed slider: slow/fast timing, live adjustment, unchanged runtime and viewport, reduced-motion accessibility');
 await page.emulateMedia({reducedMotion:'no-preference'});
 await load('DynArray<String> items = new DynArray<String>();\nitems.append("A");\nprintln(items.getLength());');
 for(let i=0;i<20;i++){await step();if((await page.locator('#state').innerText()).includes('Programm.java:2'))break;}
 const historyBeforeHelper=await page.locator('#view .history-buttons span').innerText();
 for(let i=0;i<8;i++){
  const count=await page.evaluate(()=>window.snapshots.length);
  await page.locator('.img_step-into-dark.jo_button').click();
  await page.waitForFunction(count=>window.snapshots.length>count&&!window.snapshots.at(-1).event&&window.snapshots.at(-1).state==='paused',count);
  if((await page.locator('#state').innerText()).includes('DynArray.java:'))break;
 }
 assert.match(await page.locator('#state').innerText(),/DynArray.java:/);
 assert.equal(await page.locator('#view .history-buttons span').innerText(),historyBeforeHelper);
 for(let i=0;i<80;i++){await step();if((await page.locator('#state').innerText()).includes('Programm.java:3'))break;}
 assert.match(await page.locator('#state').innerText(),/paused.*Programm.java:3/);
 const pausedLiveSourceMarkers=await sourceMarkers('jo_revealProgramPointer');
 const runtimeBeforeSourceHistory=await page.evaluate(()=>JSON.stringify(window.snapshots));
 for(let i=0;i<20;i++){
  await page.getByRole('button',{name:'Vorheriger Schritt',exact:true}).click();
  if((await page.locator('#state').innerText()).includes('Programm.java:'))break;
 }
 const marker=await sourceMarkers('jo_history_line');
 assert.equal(marker.length,1);assert.equal(marker[0].file,'Programm.java');
 assert.equal(marker[0].line,Number((await page.locator('#state').innerText()).match(/:(\d+)$/)[1]));
 assert(await page.evaluate(()=>window.online_ide_access.getIDE('edu_abstract_datatype_visualizer').ide.getMainEditor().getModel().uri.path.endsWith('Programm.java')));
 assert.equal(await page.evaluate(()=>JSON.stringify(window.snapshots)),runtimeBeforeSourceHistory);
 await page.getByRole('button',{name:'Live',exact:true}).click();
 assert.deepEqual(await sourceMarkers('jo_history_line'),[]);
 assert.deepEqual(await sourceMarkers('jo_revealProgramPointer'),pausedLiveSourceMarkers);
 assert(await page.evaluate(()=>window.online_ide_access.getIDE('edu_abstract_datatype_visualizer').ide.getMainEditor().getModel().uri.path.endsWith('Programm.java')));
 assert.equal(await page.evaluate(()=>JSON.stringify(window.snapshots)),runtimeBeforeSourceHistory);
 console.log('PASS caller-file history: stepping inside DynArray adds no history entries; replay markers remain in Programm.java');
 // An actual debugger command must leave historical browsing before it executes.
 await page.getByRole('button',{name:'Vorheriger Schritt',exact:true}).click();
 assert.match(await page.locator('#state').innerText(),/^history/);
 await step();
 assert(!((await page.locator('#state').innerText()).startsWith('history')));
 assert.equal(await page.getByRole('button',{name:'Live',exact:true}).isDisabled(),true);
 assert.deepEqual(await sourceMarkers('jo_history_line'),[]);
 console.log('PASS real debugger step automatically resumes Live and clears history highlighting');
 await load('DynArray<String> names = new DynArray<String>();\nnames.append("Anna");\nnames.append("Clara");\nnames.insertAt(1,"Ben");\nnames.delete(0);\nprintln(names.getLength());');
 await page.locator('.img_start-dark.jo_button').first().click();
 await page.waitForFunction(()=>window.snapshots.some(s=>s.event==='instruction')&&window.snapshots.at(-1).state==='stopped',null,{timeout:120000});
 const recorded=await page.evaluate(()=>window.snapshots.filter(s=>s.event==='instruction'));
 assert(recorded.length>=6);
 assert(recorded.every(s=>!s.location||s.location.file==='Programm.java'));
 assert(recorded.some(s=>objects(s,'DynArray').some(o=>o.fields.size===3)));
 assert(recorded.some(s=>objects(s,'DynArray').some(o=>o.fields.size===2)));
 assert.match(await page.locator('#metrics').innerText(),/Anzahl: 2/);
 const normalRunBeforeReplay=await page.evaluate(()=>JSON.stringify(window.snapshots));
 for(let i=0;i<200;i++){
  await page.getByRole('button',{name:'Vorheriger Schritt',exact:true}).click();
  if((await page.locator('#metrics').innerText()).includes('Anzahl: 3'))break;
 }
 assert.match(await page.locator('#metrics').innerText(),/Anzahl: 3/);
 assert.match(await page.locator('#state').innerText(),/^history/);
 for(let i=0;i<200;i++){
  await page.getByRole('button',{name:'Nächster Schritt wiedergeben',exact:true}).click();
  if((await page.locator('#metrics').innerText()).includes('Anzahl: 2'))break;
 }
 assert.match(await page.locator('#metrics').innerText(),/Anzahl: 2/);
 assert.equal(await page.evaluate(()=>JSON.stringify(window.snapshots)),normalRunBeforeReplay);
 await page.getByRole('button',{name:'Live',exact:true}).click();
 console.log(`PASS normal full-speed run: ${recorded.length} caller-file instruction snapshots, final container fields and post-run replay`);
 await load('DynArray<String> names = new DynArray<String>();\nnames.append("A");\nnames.append("C");\nnames.insertAt(1,"B");\nprintln(names.getLength());');
 for(let i=0;i<20;i++){await step();if((await page.locator('#state').innerText()).includes('Programm.java:4'))break;}
 await page.locator('#mode').selectOption('internal');
 await page.waitForFunction(()=>document.querySelectorAll('#view .react-flow__node').length===3);
 await page.waitForTimeout(200);
 const insertionIds=await page.evaluate(()=>{const s=window.snapshots.at(-1);const c=s.heap[s.variables.find(v=>v.name==='names').value.ref];const a=c.fields.first.ref;return {a,c:s.heap[a].fields.next.ref};});
 const oldNeighbor=await position(insertionIds.c);
 await page.getByRole('button',{name:'Animationsgeschwindigkeit einstellen',exact:true}).click();
 await page.getByRole('slider',{name:/Animationsgeschwindigkeit/}).press('Home');
 await page.keyboard.press('Escape');
 const insertionCamera=await viewport();
 await step();
 const insertedId=await page.evaluate(a=>{const s=window.snapshots.at(-1);return s.heap[a].fields.next.ref;},insertionIds.a);
 await page.waitForTimeout(250);
 const openingNeighbor=await position(insertionIds.c),waitingNode=await position(insertedId);
 assert(openingNeighbor.x>oldNeighbor.x&&openingNeighbor.x<660);
 assert.equal(waitingNode.y,370);
 assert.equal(await page.locator(`#view .react-flow__node[data-id="${insertedId}"]`).evaluate(e=>Number(e.style.opacity)),0);
 await page.waitForFunction(({neighbor,inserted})=>{
  const n=document.querySelector(`.react-flow__node[data-id="${neighbor}"]`),i=document.querySelector(`.react-flow__node[data-id="${inserted}"]`);
  if(!n||!i)return false;
  return new DOMMatrixReadOnly(n.style.transform).m41===660&&Number(i.style.opacity)>0&&new DOMMatrixReadOnly(i.style.transform).m42>300;
 },{neighbor:insertionIds.c,inserted:insertedId});
 await assertViewport(insertionCamera);
 await page.waitForFunction(id=>{const e=document.querySelector(`.react-flow__node[data-id="${id}"]`);return e&&new DOMMatrixReadOnly(e.style.transform).m42===300;},insertedId);
 assert.equal((await position(insertionIds.c)).x,660);
 assert.equal((await position(insertedId)).x,330);
 console.log('PASS staged insertion: gap opens before the new node rises, neighbors settle first, zoom remains stable');
 await load(await readFile(new URL('../examples/Stapel.java',import.meta.url),'utf8'));
 for(let i=0;i<20;i++){await step();if(await page.locator('#container option').count()===2)break;}
 await page.locator('#mode').selectOption('internal');
 await page.waitForFunction(()=>document.getElementById('view').textContent.includes('nextNode'));
 assert.match(await page.locator('#view').innerText(),/head/);
 assert.equal(await page.locator('#container option').count(),2);
 await page.waitForTimeout(900);
 const internalStackPositions=await page.locator('#view .react-flow__node').evaluateAll(nodes=>nodes.map(n=>{const m=new DOMMatrixReadOnly(n.style.transform);return [m.m41,m.m42];}));
 assert.equal(internalStackPositions.length,3);
 assert(internalStackPositions[0][0]<internalStackPositions[1][0]);
 assert.equal(internalStackPositions[0][1],internalStackPositions[1][1]);
 assert.equal(internalStackPositions[1][0],internalStackPositions[2][0]);
 assert(internalStackPositions[1][1]<internalStackPositions[2][1]);
 await page.locator('#mode').selectOption('abstract');
 await page.waitForFunction(()=>document.getElementById('view').textContent.includes('top · [0]'));
 await page.waitForTimeout(900);
 const stackPositions=await page.locator('#view .react-flow__node').evaluateAll(nodes=>nodes.map(n=>{const m=new DOMMatrixReadOnly(n.style.transform);return [m.m41,m.m42];}));
 assert.equal(stackPositions.length,2);
 assert.equal(stackPositions[0][0],stackPositions[1][0]);
 assert(stackPositions[0][1]<stackPositions[1][1]);
 await run(30);
 const stackSnapshots=await page.evaluate(()=>window.snapshots);
 const unbox=(s,v)=>v?.ref?s.heap[v.ref]?.fields.value:v;
 const contents=(s,o)=>{const values=[];let ref=o.fields.head;while(ref?.ref){const n=s.heap[ref.ref];if(!n)break;values.push(unbox(s,n.fields.content));ref=n.fields.nextNode;}return values;};
 // Generic contents and String return values may be boxed runtime objects.
 const sequences=stackSnapshots.flatMap(s=>objects(s,'Stapel').map(o=>contents(s,o)));
 assert(sequences.some(v=>JSON.stringify(v)==='["Ben","Anna"]'));
 assert(sequences.some(v=>JSON.stringify(v)==='["Anna"]'));
 assert(sequences.some(v=>v.length===0));
 for(const [name,value] of Object.entries({anfangsLeer:true,leerPop:null,oben:'Ben',zuerst:'Ben',danach:'Anna'})){
  assert(stackSnapshots.some(s=>s.variables.some(v=>v.name===name&&unbox(s,v.value)===value)),`Missing stack result ${name}`);
 }
 assert(stackSnapshots.some(s=>{const a=s.variables.find(v=>v.name==='alias'),b=s.variables.find(v=>v.name==='stapel');return a?.value?.ref&&a.value.ref===b?.value?.ref;}));
 assert(stackSnapshots.some(s=>s.variables.some(v=>v.name==='oben')&&objects(s,'Stapel').some(o=>contents(s,o).length===2)));
 console.log('PASS NRW stack: real compiler/runtime, LIFO chain, empty stack, aliases and storage graph');
 // Exercise both class entry points through the real JLearn compiler/runtime.
 for(const type of ['Stapel','DynArray']){
  await load(`${type}.main(new String[0]);`);
  await step();
  await page.locator('.img_step-into-dark.jo_button').click();
  await page.waitForFunction(type=>window.snapshots.at(-1)?.state==='paused'&&window.snapshots.at(-1)?.location?.file===`${type}.java`,type);
  await run(40);
  const snapshots=await page.evaluate(()=>window.snapshots);
  assert(snapshots.some(s=>objects(s,type).length>0),`Missing ${type} demo container`);
  assert(snapshots.some(s=>s.location?.file===`${type}.java`),`Missing ${type} main execution`);
 }
 console.log('PASS Stapel and DynArray main demonstrations');
 assert.deepEqual(errors,[]);console.log('PASS no browser exceptions');
}finally{await browser.close();}
