import type {Snapshot, Value, HeapObject} from './runtime';
export interface Container {object:HeapObject; elements:Value[]; storage?:HeapObject; nodes?:HeapObject[]; size:number; capacity?:number; warnings:string[]}
export interface Adapter {name:string; extract(snapshot:Snapshot,object:HeapObject):Container|undefined}
export function arrayAdapter(type:string,arrayField:string,sizeField?:string):Adapter {
 return {name:type,extract(snapshot,object){
  if(object.type!==type)return;
  const ref=object.fields[arrayField];
  const storage=ref&&typeof ref==='object'&&'ref' in ref?snapshot.heap[ref.ref]:undefined;
  if(!storage?.items)return;
  const size=sizeField?object.fields[sizeField]:storage.length;
  if(typeof size!=='number')return;
  const warnings:string[]=[];
  if(!Number.isInteger(size)||size<0||size>storage.length!)warnings.push(`Ungültige Größe ${size} bei Arraylänge ${storage.length}.`);
  if(storage.truncated)warnings.push('Speicheransicht auf 500 Einträge begrenzt.');
  return {object,storage,size,capacity:sizeField?storage.length:undefined,elements:storage.items.slice(0,Math.max(0,size)),warnings};
 }};
}
export const nativeDynArray=arrayAdapter('DynArray','elements');
/** The supplied DynArray stores Node objects, not an array. Follow actual links,
 * independently of size; retain nodes reachable only through last/current too. */
export const linkedDynArray:Adapter={name:'DynArray (Lae)',extract(snapshot,object){
 if(object.type!=='DynArray'||!('first' in object.fields)||!('size' in object.fields))return;
 const warnings:string[]=[], elements:Value[]=[], nodes:HeapObject[]=[];
 const seen=new Set<string>();
 let link=object.fields.first;
 while(link!==null){
  if(!link||typeof link!=='object'||!('ref' in link)){warnings.push('Ungültige Knotenreferenz.');break;}
  if(seen.has(link.ref)){warnings.push(`Zyklus bei @${link.ref}.`);break;}
  seen.add(link.ref);
  const node=snapshot.heap[link.ref];
  if(!node){warnings.push(`Knoten @${link.ref} nicht im begrenzten Snapshot enthalten.`);break;}
  nodes.push(node);elements.push(node.fields.contentObject===undefined?{unavailable:'Feld contentObject fehlt'}:node.fields.contentObject);
  link=node.fields.next;
 }
 const chainLast=nodes.at(-1)?.id;
 for(const field of ['last','current']){
  const ref=object.fields[field];
  if(ref&&typeof ref==='object'&&'ref' in ref&&!seen.has(ref.ref)){
   const node=snapshot.heap[ref.ref];if(node){nodes.push(node);seen.add(ref.ref);}
  }
 }
 const size=object.fields.size;
 if(typeof size!=='number')return;
 if(!Number.isInteger(size)||size<0||size!==elements.length)warnings.push(`size = ${size}, über first erreichbar: ${elements.length} Knoten (Zwischenzustand oder inkonsistent).`);
 const last=object.fields.last;
 if(chainLast ? !(last&&typeof last==='object'&&'ref' in last&&last.ref===chainLast) : last!==null)warnings.push('last stimmt nicht mit dem Ende der first-Kette überein.');
 return {object,elements,nodes,size,warnings};
}};
export function dynArray(snapshot:Snapshot,object:HeapObject){return linkedDynArray.extract(snapshot,object)??nativeDynArray.extract(snapshot,object);}
export function key(v:Value):string{return JSON.stringify(v);}
/** Match equal values once, preserving multiplicities; duplicate primitive moves are inherently ambiguous. */
export function diff(before:Value[],after:Value[]){
 const used=new Set<number>();
 const changes=after.map((v,i)=>{let from=before.findIndex((b,j)=>!used.has(j)&&j===i&&key(b)===key(v));if(from<0)from=before.findIndex((b,j)=>!used.has(j)&&key(b)===key(v));if(from<0)return {kind:'inserted',from:-1};used.add(from);return {kind:from===i?'same':'moved',from};});
 return {changes,removed:before.filter((_,i)=>!used.has(i))};
}
