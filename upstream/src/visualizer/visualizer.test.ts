import {describe,it,expect} from 'vitest';
import {Inspector,subscribe,type Value} from './runtime';
import {arrayAdapter,diff} from './adapters';
import {EventManager} from '../compiler/common/interpreter/EventManager';
function runtime(value:any){
 function symbol(name:string){return {identifier:name,identifierRange:{endLineNumber:0,endColumn:0},getValue:()=>value,getType:()=>({toString:()=> 'DynArray'})};}
 const table={getSymbolsOnStackframeForDebugger:()=>[symbol('a'),symbol('alias')],findSymbolTableAtPosition(){return this;}};
 const ps={program:{symbolTable:table,module:{file:{name:'Test.java'}},methodIdentifierWithClass:'main'},currentStepList:[{range:{startLineNumber:1,startColumn:1}}],stepIndex:0,stackBase:0};
 const thread={name:'main',programStack:[ps],s:[]};
 return {scheduler:{state:2,getCurrentThread:()=>thread,getAllThreads:()=>[thread]},eventManager:new EventManager(),beforeStepListeners:new Set()} as any;
}
const fields=(names:string[])=>names.map(identifier=>({identifier,isStatic:()=>false,getFieldIndentifier:()=>`_${identifier}`}));
describe('read-only runtime snapshots',()=>{
 it('copies fields, preserves aliases and cycles, sees the next real mutation',()=>{
  const a:any={_anzahl:0,_daten:[null],getType:()=>({identifier:'SchulArray',getOwnAndInheritedFields:()=>fields(['anzahl','daten','self'])})};a._self=a;
  const r=runtime(a),inspector=new Inspector(),s1=inspector.capture(r);a._anzahl=1;a._daten[0]='Anna';const s2=inspector.capture(r);
  expect(s1.variables[0].value).toEqual(s1.variables[1].value);expect(s2.variables[0].value).toEqual(s1.variables[0].value);
  const id=(s1.variables[0].value as any).ref;expect(s1.heap[id].fields.anzahl).toBe(0);expect(s2.heap[id].fields.anzahl).toBe(1);expect(s2.heap[id].fields.self).toEqual({ref:id});
  const c=arrayAdapter('SchulArray','daten','anzahl').extract(s2,s2.heap[id]);expect(c?.elements).toEqual(['Anna']);expect(c?.capacity).toBe(1);
 });
 it('does not invoke getters or program methods, and bounds arrays',()=>{
  let calls=0;const a:any={elements:new Array(800).fill(null),getType:()=>({identifier:'DynArray',getOwnAndInheritedFields:()=>[]}),getElements(){calls++;}};
  Object.defineProperty(a,'value',{get(){calls++;return 7;}});
  const s=new Inspector().capture(runtime(a));expect(calls).toBe(0);expect(s.truncated).toBe(true);expect(Object.values(s.heap).find(o=>o.items)?.items).toHaveLength(500);
 });
 it('keeps faulty size visible and distinguishes null from unused storage',()=>{
  const a={_anzahl:4,_daten:[null],getType:()=>({identifier:'SchulArray',getOwnAndInheritedFields:()=>fields(['anzahl','daten'])})};const s=new Inspector().capture(runtime(a));const c=arrayAdapter('SchulArray','daten','anzahl').extract(s,Object.values(s.heap)[0])!;
  expect(c.size).toBe(4);expect(c.elements).toEqual([null]);expect(c.warnings).toHaveLength(1);
 });
 it('unsubscribes both events and waits for updated scheduler state',async()=>{
  const r=runtime(null);let calls=0;const off=subscribe(r,()=>calls++);await Promise.resolve();expect(calls).toBe(1);off();r.eventManager.fire('stateChanged');r.eventManager.fire('showProgramPointer');await Promise.resolve();expect(calls).toBe(1);
 });
});
describe('state comparisons',()=>{it('tracks moves, removals and duplicate values',()=>{expect(diff(['Anna','Ben','Ben'],['Ben','Anna']).changes.map(c=>c.kind)).toEqual(['moved','moved']);expect(diff(['Anna','Ben','Ben'],['Ben','Anna']).removed).toEqual(['Ben']);expect(diff([], [null]).changes[0].kind).toBe('inserted');});});

import {linkedDynArray} from './adapters';
describe('supplied linked DynArray',()=>{
 const node=(id:string,content:string,next:Value)=>({id,type:'Node',fields:{contentObject:content,next}});
 const snapshot=(size=2):any=>({state:'paused',variables:[],truncated:false,heap:{a:{id:'a',type:'DynArray',fields:{size,first:{ref:'n1'},last:{ref:'n2'},current:{ref:'n0'}}},n1:node('n1','Anna',{ref:'n2'}),n2:node('n2','Ben',null),n0:node('n0','Alt',null)}});
 it('extracts actual links and shows detached current separately',()=>{const s=snapshot();const c=linkedDynArray.extract(s,s.heap.a)!;expect(c.elements).toEqual(['Anna','Ben']);expect(c.nodes?.map(n=>n.id)).toEqual(['n1','n2','n0']);expect(c.capacity).toBeUndefined();expect(c.warnings).toEqual([]);});
 it('does not invent or hide nodes based on an incorrect size',()=>{const s=snapshot(8);const c=linkedDynArray.extract(s,s.heap.a)!;expect(c.elements).toEqual(['Anna','Ben']);expect(c.size).toBe(8);expect(c.warnings.join()).toContain('size = 8');});
 it('terminates on cycles and reports missing snapshot nodes',()=>{const s=snapshot();s.heap.n2.fields.next={ref:'n1'};expect(linkedDynArray.extract(s,s.heap.a)?.warnings.join()).toContain('Zyklus');delete s.heap.n2;expect(linkedDynArray.extract(s,s.heap.a)?.warnings.join()).toContain('nicht im begrenzten Snapshot');});
 it('recognizes empty containers without a storage array',()=>{const s=snapshot(0);s.heap.a.fields={size:0,first:null,last:null,current:null};const c=linkedDynArray.extract(s,s.heap.a)!;expect(c.elements).toEqual([]);expect(c.nodes).toEqual([]);expect(c.warnings).toEqual([]);});
});

import { buildDiagram } from './flow-model';
describe('React Flow runtime graph',()=>{
 it('draws actual pointer edges, including detached current and cycles, without mutating snapshots',()=>{
  const a:any={id:'a',type:'DynArray',fields:{size:2,first:{ref:'n1'},last:{ref:'n2'},current:{ref:'old'}}};
  const n1:any={id:'n1',type:'Node',fields:{contentObject:'Anna',next:{ref:'n2'}}};
  const n2:any={id:'n2',type:'Node',fields:{contentObject:'Ben',next:{ref:'n1'}}};
  const old:any={id:'old',type:'Node',fields:{contentObject:'Entfernt',next:null}};
  const s:any={state:'paused',variables:[],truncated:false,heap:{a,n1,n2,old}};
  const c:any={object:a,nodes:[n1,n2,old],elements:['Anna','Ben'],size:2,warnings:[]};
  const before=JSON.stringify(s),graph=buildDiagram(c,s,undefined,undefined,'internal');
  expect(graph.nodes.map(n=>n.id)).toEqual(['a','n1','n2','old']);
  expect(graph.edges.map(e=>[e.source,e.sourceHandle,e.target])).toEqual([['a','first','n1'],['a','last','n2'],['a','current','old'],['n1','next','n2'],['n2','next','n1']]);
  expect(JSON.stringify(s)).toBe(before);
 });
 it('marks changed reference targets and represents uncaptured nodes explicitly',()=>{
  const a:any={id:'a',type:'DynArray',fields:{size:1,first:{ref:'missing'},last:null,current:null}};
  const s:any={state:'paused',variables:[],heap:{a},truncated:true};
  const old:any={...s,heap:{a:{...a,fields:{...a.fields,first:null}}}};
  const graph=buildDiagram({object:a,nodes:[],elements:[],size:1,warnings:[]},s,old,undefined,'internal');
  expect(graph.nodes.find(n=>n.id==='missing')?.data.rows[0].text).toContain('nicht vollständig');
  expect(graph.edges[0].animated).toBe(true);
  expect(graph.nodes[0].data.rows.find(r=>r.name==='first')?.changed).toBe(true);
 });
 it('keeps the abstract view independent of storage pointers',()=>{
  const a:any={id:'a',type:'DynArray',fields:{size:1,first:null}};
  const s:any={heap:{a}};
  const graph=buildDiagram({object:a,nodes:[],elements:[null],size:1,warnings:[]},s,undefined,undefined,'abstract');
  expect(graph.nodes[0].data.rows[0].text).toBe('null');expect(graph.edges).toEqual([]);
 });
});

import { planTransition, sampleTransition } from './flow-animation';
import type { VisualNode } from './flow-model';
describe('runtime-independent animation',()=>{
 const visual=(id:string,x:number,y=0):VisualNode=>({id,type:'runtime',position:{x,y},data:{title:id,rows:[],change:'same'}});
 it('drops and fades removed nodes while survivors close the gap, preserving source data',()=>{
  const old=[visual('a',0),visual('b',330)],target=[visual('b',0)];
  const before=JSON.stringify({old,target}),transition=planTransition(old,target);
  const mid=sampleTransition(transition,.3,target);
  expect(mid.find(n=>n.id==='a')?.position.y).toBeGreaterThan(0);
  expect(Number(mid.find(n=>n.id==='a')?.style.opacity)).toBeLessThan(1);
  expect(mid.find(n=>n.id==='a')?.data.history).toBe(true);
  expect(mid.find(n=>n.id==='b')!.position.x).toBeGreaterThan(0);
  expect(mid.find(n=>n.id==='b')!.position.x).toBeLessThan(330);
  expect(sampleTransition(transition,1,target).map(n=>n.id)).toEqual(['b']);
  expect(JSON.stringify({old,target})).toBe(before);
 });
 it('restarts rapid changes from the currently displayed positions without a jump or resurrection',()=>{
  const old=[visual('a',0),visual('b',330)],target=[visual('b',0)];
  const mid=sampleTransition(planTransition(old,target),.25,target);
  const next=[visual('b',0),visual('c',330)];
  const start=sampleTransition(planTransition(mid,next),0,next);
  expect(start.find(n=>n.id==='b')?.position).toEqual(mid.find(n=>n.id==='b')?.position);
  expect(sampleTransition(planTransition(mid,next),1,next).map(n=>n.id)).toEqual(['b','c']);
 });
 it('moves a still-referenced detached node downward without pretending it was destroyed',()=>{
  const old=[visual('a',0,300)],target=[{...visual('a',0,540),data:{...old[0].data,detached:true}}];
  const end=sampleTransition(planTransition(old,target),1,target)[0];
  expect(end.position.y).toBe(540);expect(end.style.opacity).toBe(1);
  expect(end.data.detached).toBe(true);expect(end.data.history).toBe(false);
 });
 it('keeps linked abstract element identities across removal even with duplicate contents',()=>{
  const a:any={id:'a',type:'DynArray',fields:{size:2}};
  const c:any={object:a,nodes:[{id:'n1'},{id:'n2'}],elements:['Same','Same'],size:2,warnings:[]};
  const before=buildDiagram(c,{heap:{}} as any,undefined,undefined,'abstract');
  const after=buildDiagram({...c,nodes:[{id:'n2'}],elements:['Same']},{heap:{}} as any,undefined,c,'abstract');
  expect(after.nodes[0].id).toBe(before.nodes[1].id);
 });
});

import { SnapshotHistory } from './snapshot-history';
describe('recorded snapshot history',()=>{
 const halt=(line:number):any=>({state:'paused',location:{file:'Program.java',line},variables:[],heap:{},truncated:false});
 it('records halts, pins past states while execution continues, and returns to live without changing snapshots',()=>{
  const h=new SnapshotHistory(),a=halt(1),b=halt(2),c=halt(3),before=JSON.stringify(a);
  h.accept(a);h.accept({...a,state:'running'});h.accept(b);
  expect(h.getState().entries).toHaveLength(2);h.back();expect(h.getState().display).toBe(a);expect(h.getState().instant).toBe(true);
  h.accept(c);expect(h.getState().display).toBe(a);expect(h.getState().following).toBe(false);
  h.forward();expect(h.getState().display).toBe(b);expect(h.getState().instant).toBe(false);
  h.live();expect(h.getState().display).toBe(c);expect(h.getState().following).toBe(true);expect(JSON.stringify(a)).toBe(before);
 });
 it('keeps the final halt inspectable after termination and clears records for a new run',()=>{
  const h=new SnapshotHistory(),a=halt(1);h.accept(a);h.accept({...a,state:'stopped',variables:[]});
  expect(h.getState().display).toBe(a);expect(h.getState().runtimeState).toBe('stopped');
  h.accept({...a,state:'running'});expect(h.getState().entries).toEqual([]);expect(h.getState().total).toBe(0);
 });
 it('bounds memory and keeps a pinned cursor valid when old entries are evicted',()=>{
  const h=new SnapshotHistory(2);h.accept(halt(1));h.accept(halt(2));h.back();h.accept(halt(3));
  expect(h.getState().entries.map(e=>e.step)).toEqual([2,3]);expect(h.getState().cursor).toBe(0);expect(h.getState().display?.location?.line).toBe(2);
 });
 it('replays an existing transition and cancels replay when navigating elsewhere',async()=>{
  const h=new SnapshotHistory();h.accept(halt(1));h.accept(halt(2));h.replay();
  expect(h.getState().cursor).toBe(0);expect(h.getState().instant).toBe(true);
  await new Promise(resolve=>setTimeout(resolve,150));expect(h.getState().cursor).toBe(1);expect(h.getState().instant).toBe(false);
  h.replay();h.live();await new Promise(resolve=>setTimeout(resolve,150));expect(h.getState().following).toBe(true);
 });
});

describe('continuous-run recording and debugger resumption',()=>{
 const snapshot=(line:number,event?:'instruction'|'resume',state:'running'|'paused'='running'):any=>({event,state,location:{file:'Program.java',line},variables:[],heap:{},truncated:false});
 it('records every synchronous instruction boundary while batching only display notifications',async()=>{
  const h=new SnapshotHistory();let notices=0;h.subscribe(()=>notices++);
  h.accept(snapshot(1,'instruction'));h.accept(snapshot(2,'instruction'));h.accept(snapshot(3,'instruction'));
  expect(h.getState().entries.map(e=>e.snapshot.location?.line)).toEqual([1,2,3]);expect(notices).toBe(0);
  await Promise.resolve();expect(notices).toBe(1);
  h.accept({...snapshot(4),state:'stopped'});expect(h.getState().display?.location?.line).toBe(3);
 });
 it('switches a historical selection to live before an actual debugger step, without adding a phantom entry',()=>{
  const h=new SnapshotHistory();h.accept(snapshot(1,undefined,'paused'));h.accept(snapshot(2,undefined,'paused'));h.back();
  h.accept(snapshot(2,'resume','paused'));expect(h.getState().following).toBe(true);expect(h.getState().entries).toHaveLength(2);
  h.accept(snapshot(3,undefined,'paused'));expect(h.getState().cursor).toBe(2);expect(h.getState().display?.location?.line).toBe(3);
 });
 it('unsubscribes both normal-run and execution-command observers',async()=>{
  const r=runtime(null);let notices=0;const off=subscribe(r,()=>notices++);await Promise.resolve();
  expect(r.beforeStepListeners.size).toBe(1);off();expect(r.beforeStepListeners.size).toBe(0);
  r.eventManager.fire('executionRequested');await Promise.resolve();expect(notices).toBe(1);
 });
});

describe('entry-file history granularity',()=>{
 const state=(file:string,line:number,event?:'instruction'):any=>({entryFile:'Lesson.java',state:'paused',event,location:{file,line},variables:[],heap:{},truncated:false});
 it('records only the actual entry file, including when the first halt is in a helper',()=>{
  const history=new SnapshotHistory();history.accept(state('DynArray.java',10));expect(history.getState().entries).toHaveLength(0);
  history.accept(state('Lesson.java',2));history.accept(state('DynArray.java',40,'instruction'));history.accept(state('OtherHelper.java',3));
  history.accept(state('Lesson.java',3,'instruction'));
  expect(history.getState().entries.map(e=>e.snapshot.location)).toEqual([{file:'Lesson.java',line:2},{file:'Lesson.java',line:3}]);
 });
 it('can return to the real live helper position without adding it to history',()=>{
  const history=new SnapshotHistory();history.accept(state('Lesson.java',1));history.accept(state('Lesson.java',2));
  const helper=state('DynArray.java',15);history.accept(helper);history.back();history.live();
  expect(history.getState().display).toBe(helper);expect(history.getState().entries).toHaveLength(2);
 });
});

describe('action-specific insertion choreography',()=>{
 const node=(id:string,x:number):VisualNode=>({id,type:'runtime',position:{x,y:300},data:{title:id,rows:[],change:'same'}});
 it('opens the gap completely before the inserted node rises from below',()=>{
  const before=[node('a',0),node('b',330)],after=[node('a',0),node('new',330),node('b',660)];
  const plan=planTransition(before,after);expect(plan.kind).toBe('insertion');
  const opening=sampleTransition(plan,.2,after);
  expect(opening.find(n=>n.id==='b')!.position.x).toBeGreaterThan(330);
  expect(opening.find(n=>n.id==='b')!.position.x).toBeLessThan(660);
  expect(opening.find(n=>n.id==='new')!.position.y).toBe(370);
  expect(opening.find(n=>n.id==='new')!.style.opacity).toBe(0);
  const gap=sampleTransition(plan,plan.gapEnd,after);
  expect(gap.find(n=>n.id==='b')!.position.x).toBe(660);
  expect(gap.find(n=>n.id==='new')!.position.y).toBe(370);
  const entering=sampleTransition(plan,.7,after);
  expect(entering.find(n=>n.id==='b')!.position.x).toBe(660);
  expect(entering.find(n=>n.id==='new')!.position.y).toBeGreaterThan(300);
  expect(entering.find(n=>n.id==='new')!.position.y).toBeLessThan(370);
  expect(Number(entering.find(n=>n.id==='new')!.style.opacity)).toBeGreaterThan(0);
  expect(sampleTransition(plan,1,after).map(n=>n.position)).toEqual(after.map(n=>n.position));
 });
 it('avoids an empty opening phase for append and retains the removal action',()=>{
  const before=[node('a',0)],after=[node('a',0),node('b',330)];
  const append=planTransition(before,after);expect(append.kind).toBe('insertion');expect(append.gapEnd).toBe(0);
  expect(sampleTransition(append,.2,after).find(n=>n.id==='b')!.position.y).toBeLessThan(370);
  expect(planTransition(after,before).kind).toBe('removal');
 });
});

describe('history scrubber navigation',()=>{
 it('seeks directly without animation or extra records, then supports animated forward replay',()=>{
  const history=new SnapshotHistory();
  for(let line=1;line<=4;line++)history.accept({state:'paused',location:{file:'Program.java',line},variables:[],heap:{},truncated:false});
  history.seek(0);expect(history.getState().cursor).toBe(0);expect(history.getState().instant).toBe(true);expect(history.getState().following).toBe(false);
  history.seek(2);expect(history.getState().display?.location?.line).toBe(3);
  history.forward();expect(history.getState().instant).toBe(false);expect(history.getState().display?.location?.line).toBe(4);
  history.seek(99);history.seek(NaN);expect(history.getState().cursor).toBe(3);expect(history.getState().total).toBe(4);
 });
});

import {linkedStack} from './adapters';
describe('NRW stack visualization',()=>{
 const snapshot=():any=>({state:'paused',variables:[],truncated:false,heap:{
  a:{id:'a',type:'Stapel',fields:{head:{ref:'b'}}},
  b:{id:'b',type:'StackNode',fields:{content:'Ben',nextNode:{ref:'c'}}},
  c:{id:'c',type:'StackNode',fields:{content:'Anna',nextNode:null}}
 }});
 it('follows head in LIFO order and draws real storage pointers without mutation',()=>{
  const s=snapshot(),before=JSON.stringify(s),c=linkedStack.extract(s,s.heap.a)!;
  expect(c.elements).toEqual(['Ben','Anna']);expect(c.size).toBe(2);expect(c.warnings).toEqual([]);
  const graph=buildDiagram(c,s,undefined,undefined,'internal');
  expect(graph.edges.map(e=>[e.source,e.sourceHandle,e.target])).toEqual([['a','head','b'],['b','nextNode','c']]);
  expect(graph.nodes.map(n=>n.position)).toEqual([{x:0,y:0},{x:0,y:300},{x:0,y:600}]);
  const abstract=buildDiagram(c,s,undefined,undefined,'abstract');
  expect(abstract.nodes[0].data.title).toContain('top');
  expect(abstract.nodes[1].position.y).toBeGreaterThan(abstract.nodes[0].position.y);
  expect(abstract.nodes[1].position.x).toBe(abstract.nodes[0].position.x);
  expect(JSON.stringify(s)).toBe(before);
 });
 it('retains survivor identity after pop and recognizes empty stacks',()=>{
  const s=snapshot(),before=linkedStack.extract(s,s.heap.a)!;
  const old=buildDiagram(before,s,undefined,undefined,'abstract');
  s.heap.a.fields.head={ref:'c'};
  const after=linkedStack.extract(s,s.heap.a)!;
  expect(after.elements).toEqual(['Anna']);
  expect(buildDiagram(after,s,undefined,before,'abstract').nodes[0].id).toBe(old.nodes[1].id);
  s.heap.a.fields.head=null;
  expect(linkedStack.extract(s,s.heap.a)).toMatchObject({size:0,elements:[],nodes:[],warnings:[]});
 });
 it('bounds cycles and reports missing or invalid links and content',()=>{
  const s=snapshot();s.heap.c.fields.nextNode={ref:'b'};
  expect(linkedStack.extract(s,s.heap.a)?.warnings.join()).toContain('Zyklus');
  delete s.heap.c;
  expect(linkedStack.extract(s,s.heap.a)?.warnings.join()).toContain('nicht im begrenzten Snapshot');
  s.heap.b.fields.nextNode=42;delete s.heap.b.fields.content;
  const c=linkedStack.extract(s,s.heap.a)!;
  expect(c.warnings.join()).toContain('Ungültige');
  expect(c.elements).toEqual([{unavailable:'Feld content fehlt'}]);
  expect(linkedStack.extract(s,{id:'x',type:'Other',fields:{head:null}})).toBeUndefined();
 });
});
