import { memo, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { createRoot } from 'react-dom/client';
import {
  ReactFlow, ReactFlowProvider, Background, Handle, Position,
  applyNodeChanges, useNodesInitialized, useReactFlow,
  type NodeProps, type NodeChange,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { FlowControls, HistoryControls } from './flow-controls';
import type { Diagram, VisualNode } from './flow-model';
import { getAnimationSpeed, subscribeAnimationSpeed } from './animation-speed';
import { planTransition, sampleTransition, TRANSITION_MS } from './flow-animation';

const RuntimeNode = memo(function RuntimeNode({ data }: NodeProps<VisualNode>) {
  return <div className={`runtime-node ${data.change}`}>
    <Handle id="in" type="target" position={Position.Left} isConnectable={false} />
    <Handle id="pointer" type="target" position={Position.Top} isConnectable={false} />
    <strong>{data.title}</strong>
    {data.history && <small className="runtime-status">Entfernt · vorheriger Zustand</small>}
    {data.detached && !data.history && <small className="runtime-status">Außerhalb der first-Kette · weiterhin referenziert</small>}
    {data.rows.map(row => <div key={row.name} className={`runtime-row ${row.changed ? 'changed' : ''}`}>
      <span>{row.name} = {row.text}</span>
      {row.reference && <Handle id={row.name} type="source" position={Position.Right} isConnectable={false} />}
    </div>)}
  </div>;
});
const nodeTypes = { runtime: RuntimeNode };

function DiagramView({ diagram, instant, viewRevision }: { diagram: Diagram; instant: boolean; viewRevision: number }) {
  const [nodes, setNodes] = useState<VisualNode[]>(diagram.nodes);
  const speed = useSyncExternalStore(subscribeAnimationSpeed, getAnimationSpeed);
  const speedRef = useRef(speed);
  speedRef.current = speed;
  const displayed = useRef(nodes);
  const latest = useRef(diagram.nodes);
  const animation = useRef<number | undefined>(undefined);
  const signature = (list: VisualNode[]) => list.map(n => `${n.id}:${n.position.x}:${n.position.y}`).join('|');
  const targetSignature = useRef(signature(diagram.nodes));
  const lastViewRevision = useRef(viewRevision);
  const [moving, setMoving] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const initialized = useNodesInitialized();
  const { fitView } = useReactFlow();
  const initiallyFitted = useRef(false);
  const commit = (next: VisualNode[]) => { displayed.current = next; setNodes(next); };
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const changed = () => setReducedMotion(query.matches);
    query.addEventListener('change', changed);
    return () => query.removeEventListener('change', changed);
  }, []);
  useEffect(() => () => { if (animation.current !== undefined) cancelAnimationFrame(animation.current); }, []);
  useEffect(() => {
    latest.current = diagram.nodes;
    const nextSignature = signature(diagram.nodes);
    const changedView = lastViewRevision.current !== viewRevision;
    lastViewRevision.current = viewRevision;
    if (changedView) initiallyFitted.current = false;
    if (reducedMotion || instant || changedView) {
      if (animation.current !== undefined) cancelAnimationFrame(animation.current);
      animation.current = undefined;
      targetSignature.current = nextSignature;
      setMoving(false);
      commit(diagram.nodes);
      return;
    }
    if (nextSignature === targetSignature.current) {
      // State/location-only events must not restart an in-flight transition.
      const live = new Map(diagram.nodes.map(n => [n.id, n]));
      commit(displayed.current.map(node => {
        const update = live.get(node.id);
        return update ? { ...update, position: node.position, style: node.style } : node;
      }));
      return;
    }
    targetSignature.current = nextSignature;
    if (animation.current !== undefined) cancelAnimationFrame(animation.current);
    const transition = planTransition(displayed.current, diagram.nodes);
    let previousTime = performance.now();
    let elapsed = 0;
    setMoving(true);
    commit(sampleTransition(transition, 0, latest.current));
    const tick = (now: number) => {
      elapsed += (now - previousTime) * speedRef.current;
      previousTime = now;
      const progress = Math.min(1, elapsed / TRANSITION_MS);
      commit(sampleTransition(transition, progress, latest.current));
      if (progress < 1) animation.current = requestAnimationFrame(tick);
      else { animation.current = undefined; setMoving(false); }
    };
    animation.current = requestAnimationFrame(tick);
  }, [diagram, reducedMotion, instant, viewRevision]);
  useEffect(() => {
    if (!initialized || initiallyFitted.current) return;
    // Frame this view once. Runtime changes must never move the camera.
    const frame = requestAnimationFrame(() => {
      initiallyFitted.current = true;
      void fitView({ padding: 0.18, maxZoom: 1 });
    });
    return () => cancelAnimationFrame(frame);
  }, [initialized, fitView, viewRevision]);
  const onNodesChange = (changes: NodeChange<VisualNode>[]) => {
    const applicable = moving ? changes.filter(change => change.type !== 'position') : changes;
    commit(applyNodeChanges(applicable, displayed.current));
  };
  return <ReactFlow<VisualNode> nodes={nodes} edges={diagram.edges.map(edge => {
    const opacity = Math.min(Number(nodes.find(node => node.id === edge.source)?.style?.opacity ?? 1), Number(nodes.find(node => node.id === edge.target)?.style?.opacity ?? 1));
    return { ...edge, style: { ...edge.style, opacity } };
  })} nodeTypes={nodeTypes}
    onNodesChange={onNodesChange} nodesDraggable={!moving} nodesConnectable={false} edgesReconnectable={false}
    deleteKeyCode={null} minZoom={0.1} maxZoom={2} colorMode="dark"
    ariaLabelConfig={{ 'controls.zoomIn.ariaLabel': 'Vergrößern', 'controls.zoomOut.ariaLabel': 'Verkleinern', 'controls.fitView.ariaLabel': 'Gesamte Struktur anzeigen' }}>
    <Background /><FlowControls /><HistoryControls />
    {!nodes.length && <div className="flow-empty">{diagram === emptyDiagram ? 'Kein Container in diesem Zustand' : 'Leere Reihung'}</div>}
  </ReactFlow>;
}

const root = createRoot(document.getElementById('view')!);
const emptyDiagram: Diagram = { nodes: [], edges: [] };
export function renderDiagram(diagram: Diagram | undefined, instant = false, viewRevision = 0) {
  root.render(<ReactFlowProvider><DiagramView diagram={diagram ?? emptyDiagram} instant={instant} viewRevision={viewRevision} /></ReactFlowProvider>);
}
