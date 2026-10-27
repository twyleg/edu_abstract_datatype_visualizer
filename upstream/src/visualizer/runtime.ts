import type { Thread } from '../compiler/common/interpreter/Thread';
import { JavaSymbolTable } from '../compiler/java/codegenerator/JavaSymbolTable';
import type { Interpreter } from '../compiler/common/interpreter/Interpreter';
import { DebuggerCallstackEntry } from '../compiler/common/debugger/DebuggerCallstackEntry';
import { SchedulerState } from '../compiler/common/interpreter/SchedulerState';
export type Value = null | boolean | number | string | {ref:string} | {unavailable:string};
export interface HeapObject {id:string; type:string; fields:Record<string,Value>; items?:Value[]; length?:number; truncated?:boolean}
export interface Snapshot {entryFile?:string; event?:'instruction'|'resume'; state:'running'|'paused'|'stopped'|'error'; location?:{file:string;line:number}; variables:{name:string;type:string;value:Value;frame:string}[]; heap:Record<string,HeapObject>; truncated:boolean}
/** Copies data only. Never calls Java methods, getters, toString or getElements. */
export class Inspector {
  private ids = new WeakMap<object,string>(); private next=1; private entryFile?:string;
  capture(interpreter:Interpreter, executingThread?:Thread):Snapshot {
    const state=interpreter.scheduler.state;
    const entryModule=interpreter.scheduler.getAllThreads().find(thread=>thread.name==='main thread')?.programStack[0]?.program.module;
    if(entryModule)this.entryFile=entryModule.file.name;
    const result:Snapshot={entryFile:this.entryFile,state:state===SchedulerState.running?'running':state===SchedulerState.paused?'paused':state===SchedulerState.error?'error':'stopped',variables:[],heap:{},truncated:false};
    const read=(value:any,depth=0):Value=>{
      if(value===null) return null;
      if(['string','number','boolean'].includes(typeof value)) return value;
      if(typeof value!=='object') return {unavailable:typeof value};
      let id=this.ids.get(value); if(!id){id=`o${this.next++}`;this.ids.set(value,id);}
      if(result.heap[id]) return {ref:id};
      if(depth>8 || Object.keys(result.heap).length>=500){result.truncated=true;return {ref:id};}
      const type=typeof value.getType==='function'?value.getType():undefined;
      const node:HeapObject={id,type:Array.isArray(value)?'Array':type?.identifier??'Object',fields:{}};
      result.heap[id]=node;
      if(Array.isArray(value)){
        node.length=value.length;node.items=[];
        for(let i=0;i<Math.min(value.length,500);i++) node.items.push(read(Object.getOwnPropertyDescriptor(value,String(i))?.value,depth+1));
        node.truncated=value.length>500;result.truncated ||= node.truncated;
      } else {
        for(const field of type?.getOwnAndInheritedFields?.()??[]){
          if(field.isStatic()) continue;
          const key=field.getFieldIndentifier();
          node.fields[field.identifier]=read(Object.getOwnPropertyDescriptor(value,key)?.value,depth+1);
        }
        // Native library storage and boxed values are not declared Java fields.
        for(const key of ['elements','value']){
          const descriptor=Object.getOwnPropertyDescriptor(value,key);
          if(descriptor && 'value' in descriptor) node.fields[key]=read(descriptor.value,depth+1);
        }
      }
      return {ref:id};
    };
    for(const thread of interpreter.scheduler.getAllThreads()){
      for(const ps of thread.programStack){
        const entry=new DebuggerCallstackEntry(ps);
        if(thread===(executingThread??interpreter.scheduler.getCurrentThread()) && ps===thread.programStack.at(-1) && entry.range?.startLineNumber>0){
          result.location={file:ps.program.module.file.name,line:entry.range.startLineNumber};
        }
        for(let table=entry.symbolTable;table;table=table.parent){
          if(table instanceof JavaSymbolTable && table.classContext && table.classContext!==table.parent?.classContext){
            for(const field of table.classContext.getFields().filter(f=>f.isStatic()&&!f.hiddenWhenDebugging)){
              const klass=interpreter.scheduler.classObjectRegistry[field.classEnum.identifier];
              const p=entry.range,r=field.identifierRange;
              if(p && (r.endLineNumber>p.startLineNumber || r.endLineNumber===p.startLineNumber && r.endColumn>=p.startColumn))continue;
              const frame=`static:${field.classEnum.identifier}`;
              if(!result.variables.some(v=>v.frame===frame&&v.name===field.identifier))result.variables.push({name:field.identifier,type:field.getType().toString(),value:read(klass?.[field.getInternalName()]),frame});
            }
          }
          for(const symbol of table.getSymbolsOnStackframeForDebugger()){
            if(symbol.hiddenWhenDebugging) continue;
            const r=symbol.identifierRange,p=entry.range;
            if(p && (r.endLineNumber>p.startLineNumber || r.endLineNumber===p.startLineNumber && r.endColumn>=p.startColumn)) continue;
            const frame=`${thread.name}:${thread.programStack.indexOf(ps)}:${ps.program.methodIdentifierWithClass}`;
            if(result.variables.some(v=>v.frame===frame&&v.name===symbol.identifier)) continue;
            result.variables.push({name:symbol.identifier,type:symbol.getType()?.toString()??'?',value:read(symbol.getValue(thread.s,ps.stackBase)),frame});
          }
        }
      }
    }
    return result;
  }
}
export function subscribe(interpreter:Interpreter, listener:(snapshot:Snapshot)=>void):()=>void {
  const inspector=new Inspector(); let pending=false,active=true;
  const notify=()=>{if(pending)return;pending=true;queueMicrotask(()=>{pending=false;if(active)listener(inspector.capture(interpreter));});};
  const position=()=>notify();
  const resume=()=>{if(active)listener({...inspector.capture(interpreter),event:'resume'});};
  const instruction=(thread:Thread)=>{
    if(!active||interpreter.scheduler.keepThread||thread.currentProgramState?.program.isReplProgram)return;
    // Record caller-file boundaries, so a container method is replayed as one operation.
    const entryModule=interpreter.scheduler.getAllThreads().find(t=>t.name==='main thread')?.programStack[0]?.program.module;
    if(!entryModule||thread.currentProgramState?.program.module!==entryModule)return;
    listener({...inspector.capture(interpreter,thread),event:'instruction'});
  };
  interpreter.beforeStepListeners.add(instruction);
  interpreter.eventManager.on('executionRequested',resume);
  interpreter.eventManager.on('showProgramPointer',position);
  interpreter.eventManager.on('stateChanged',notify);
  notify();
  return ()=>{active=false;interpreter.beforeStepListeners.delete(instruction);interpreter.eventManager.off(resume);interpreter.eventManager.off(notify);
    interpreter.eventManager.off(position);};

}
