import { MarkerType, type Node, type Edge } from '@xyflow/react';
import type { Container } from './adapters';
import { diff, key } from './adapters';
import type { Snapshot, Value } from './runtime';

export type FieldRow = { name: string; text: string; changed: boolean; reference: boolean };
export type VisualNode = Node<{ title: string; rows: FieldRow[]; change: string; detached?: boolean; history?: boolean }, 'runtime'>;
export interface Diagram { nodes: VisualNode[]; edges: Edge[] }

export function valueLabel(value: Value, snapshot: Snapshot): string {
  if (value && typeof value === 'object') {
    if ('unavailable' in value) return `⟨${value.unavailable}⟩`;
    const object = snapshot.heap[value.ref];
    const boxed = object?.fields.value;
    return boxed !== undefined && (boxed === null || typeof boxed !== 'object')
      ? `${String(boxed)} · @${value.ref}` : `${object?.type ?? 'Objekt'} @${value.ref}`;
  }
  return value === null ? 'null' : String(value);
}

/** Layout and edges describe copied state only; dragging never writes to Java objects. */
export function buildDiagram(container: Container, snapshot: Snapshot, previous: Snapshot | undefined,
  oldContainer: Container | undefined, mode: string): Diagram {
  const nodes: VisualNode[] = [], edges: Edge[] = [];
  const rows = (id: string, fields: Record<string, Value>): FieldRow[] => Object.entries(fields).map(([name, value]) => ({
    name, text: valueLabel(value, snapshot),
    changed: !!previous?.heap[id] && key(previous.heap[id].fields[name]) !== key(value),
    reference: !!value && typeof value === 'object' && 'ref' in value,
  }));
  const node = (id: string, title: string, fields: FieldRow[], x: number, y: number, change = 'same') => {
    nodes.push({ id, type: 'runtime', position: { x, y }, data: { title, rows: fields, change } });
  };
  if (mode === 'abstract') {
    const delta = diff(oldContainer?.elements ?? [], container.elements);
    const occurrences = new Map<string, number>();
    container.elements.forEach((value, index) => {
      const identity = container.nodes?.[index]?.id ?? key(value);
      const occurrence = occurrences.get(identity) ?? 0;
      occurrences.set(identity, occurrence + 1);
      node(`item:${container.object.id}:${identity}:${occurrence}`, container.kind === 'stack' ? (index === 0 ? 'top · [0]' : `[${index}]`) : `[${index}]`, [{ name: 'Inhalt', text: valueLabel(value, snapshot), changed: false, reference: false }],
        container.kind === 'stack' ? 0 : index * 270, container.kind === 'stack' ? index * 150 : 0, delta.changes[index].kind);
    });
    return { nodes, edges };
  }
  node(container.object.id, `${container.object.type} @${container.object.id}`, rows(container.object.id, container.object.fields), 0, 0);
  if (container.nodes) {
    container.nodes.forEach((object, index) => {
      const detached = index >= container.elements.length;
      node(object.id, `${object.type} @${object.id}`, rows(object.id, object.fields),
        (detached ? index - container.elements.length : index) * 330, detached ? 540 : 300,
        previous && !previous.heap[object.id] ? 'inserted' : 'same');
      nodes.at(-1)!.data.detached = detached;
    });
    const connect = (source: string, fields: Record<string, Value>, names: string[]) => {
      for (const name of names) {
        const value = fields[name];
        if (!value || typeof value !== 'object' || !('ref' in value)) continue;
        if (!nodes.some(n => n.id === value.ref)) {
          node(value.ref, `@${value.ref}`, [{ name: 'Snapshot', text: 'Knoten nicht vollständig erfasst', changed: false, reference: false }], (nodes.length - 1) * 330, 300);
        }
        const changed = !!previous?.heap[source] && key(previous.heap[source].fields[name]) !== key(value);
        edges.push({ id: `${source}:${name}`, source, sourceHandle: name, target: value.ref, targetHandle: source === container.object.id ? 'pointer' : 'in', label: name,
          type: 'smoothstep', animated: changed, style: { stroke: changed ? '#eabb61' : '#67dbc8', strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed, color: changed ? '#eabb61' : '#67dbc8' } });
      }
    };
    connect(container.object.id, container.object.fields, ['first', 'last', 'current', 'head']);
    for (const object of container.nodes) connect(object.id, object.fields, ['next', 'nextNode']);
  } else if (container.storage) {
    const storage = container.storage;
    node(storage.id, `Array @${storage.id}`, (storage.items ?? []).map((value, index) => ({ name: `[${index}]`, text: valueLabel(value, snapshot),
      changed: !!previous?.heap[storage.id] && key(previous.heap[storage.id].items?.[index]) !== key(value), reference: false })), 350, 0);
    for (const [name, value] of Object.entries(container.object.fields)) {
      if (value && typeof value === 'object' && 'ref' in value && value.ref === storage.id)
        edges.push({ id: `${container.object.id}:${name}`, source: container.object.id, sourceHandle: name, target: storage.id, targetHandle: 'in', label: name, markerEnd: { type: MarkerType.ArrowClosed } });
    }
  }
  return { nodes, edges };
}
