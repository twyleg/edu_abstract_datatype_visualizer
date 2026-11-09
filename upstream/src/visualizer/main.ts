import { getVisualizerUI, publishVisualizerUI, subscribeVisualizerChoices } from './visualizer-ui';
import { installSplitPane } from './split-pane';
import { snapshotHistory } from './snapshot-history';
import { buildDiagram } from './flow-model';
import { renderDiagram } from './flow-view';
import stackSource from './Stapel.java?raw';
import dynArraySource from './DynArray.java?raw';
import './style.css';
import type {Snapshot} from './runtime';
import {arrayAdapter,dynArray,linkedStack} from './adapters';
document.querySelector('script[title="DynArray.java"]')!.textContent=dynArraySource;
document.querySelector('script[title="Stapel.java"]')!.textContent=stackSource;
let current:Snapshot|undefined, previous:Snapshot|undefined;
let viewRevision=0;
let historySource: {setHistoryLocation(location?: {file:string;line:number}):void; layoutEditor():void}|undefined;
function render(){
 const history = snapshotHistory.getState();
 const ui = getVisualizerUI();
 historySource?.setHistoryLocation(history.following ? undefined : current?.location);
 const status = `${history.following?history.runtimeState:'history'} ${current?.location?`· ${current.location.file}:${current.location.line}`:''}`;
 if(!current){
  publishVisualizerUI({status,containers:[],selected:'',metrics:'',messages:[]});
  renderDiagram(undefined,true,viewRevision);return;
 }
 const custom=arrayAdapter(ui.adapter.type,ui.adapter.array,ui.adapter.size||undefined);
 const containers=Object.values(current.heap).flatMap(o=>{const c=dynArray(current!,o)??linkedStack.extract(current!,o)??custom.extract(current!,o);return c?[c]:[];});
 const selected=containers.some(c=>c.object.id===ui.selected)?ui.selected:containers[0]?.object.id??'';
 const options=containers.map(c=>{
  const names=current!.variables.filter(v=>v.value&&typeof v.value==='object'&&'ref' in v.value&&v.value.ref===c.object.id).map(v=>v.name);
  return {id:c.object.id,label:`${names.join(' = ')||c.object.type} · ${c.object.id}`};
 });
 const c=containers.find(c=>c.object.id===selected);
 publishVisualizerUI({status,containers:options,selected,
  metrics:c?`Anzahl: ${c.size}${c.nodes?' · Knotenstruktur':c.capacity===undefined?'':` · Kapazität: ${c.capacity}`}`:'',
  messages:[...(c?.warnings??[]),...(current.truncated?['Objektinspektion begrenzt.']:[])]});
 if(!c){renderDiagram(undefined,history.instant,viewRevision);return;}
 const old=previous?.heap[c.object.id];
 const oldContainer=old?(dynArray(previous!,old)??linkedStack.extract(previous!,old)??custom.extract(previous!,old)):undefined;
 renderDiagram(buildDiagram(c,current,previous,oldContainer,ui.mode),history.instant,viewRevision);
}
subscribeVisualizerChoices(()=>{viewRevision++;render();});
installSplitPane(()=>historySource?.layoutEditor());
snapshotHistory.subscribe(()=>{previous=current;current=snapshotHistory.getState().display;render();});
render();
(window as any).online_ide_onReady=()=>{
 const ide=(window as any).online_ide_access.getIDE('edu_abstract_datatype_visualizer');
 historySource=ide;
 ide.layoutEditor();
 ide.subscribeDebugger((s:Snapshot)=>snapshotHistory.accept(s));
};
import '../client/embedded/EmbeddedStarter';
