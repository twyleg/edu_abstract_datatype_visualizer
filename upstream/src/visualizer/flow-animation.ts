import type { VisualNode } from './flow-model';

export const TRANSITION_MS = 700;
interface Motion { node: VisualNode; from: { x: number; y: number }; to: { x: number; y: number }; opacity: number; entering: boolean; exiting: boolean }
export type TransitionKind = 'insertion' | 'removal' | 'rearrange';
export interface Transition { motions: Motion[]; kind: TransitionKind; gapEnd: number }
const clamp = (value: number) => Math.max(0, Math.min(1, value));

/** Historical nodes are display-only copies and never re-enter the runtime graph. */
export function planTransition(displayed: VisualNode[], target: VisualNode[]): Transition {
  const old = new Map(displayed.map(node => [node.id, node]));
  const ids = new Set(target.map(node => node.id));
  const motions: Motion[] = target.map(node => {
    const previous = old.get(node.id);
    return { node, from: previous?.position ?? { x: node.position.x, y: node.position.y + 70 }, to: node.position,
      opacity: previous ? Number(previous.style?.opacity ?? 1) : 0, entering: !previous || !!previous.data.detached && !node.data.detached, exiting: false };
  });
  for (const node of displayed) {
    if (!ids.has(node.id)) motions.push({ node, from: node.position, to: { x: node.position.x, y: node.position.y + 150 },
      opacity: Number(node.style?.opacity ?? 1), entering: false, exiting: true });
  }
  const inserting = motions.some(m => m.entering && !m.node.data.detached);
  const removing = motions.some(m => m.exiting || m.node.data.detached && !old.get(m.node.id)?.data.detached);
  const kind: TransitionKind = inserting && !removing ? 'insertion' : removing && !inserting ? 'removal' : 'rearrange';
  const needsGap = motions.some(m => !m.entering && !m.exiting && (m.from.x !== m.to.x || m.from.y !== m.to.y));
  // Only insertion with shifted neighbors needs a gap-opening phase. Append can enter immediately.
  return { motions, kind, gapEnd: kind === 'insertion' && needsGap ? 0.45 : 0 };
}

export function sampleTransition(transition: Transition, progress: number, latest: VisualNode[]): VisualNode[] {
  const t = clamp(progress);
  const live = new Map(latest.map(node => [node.id, node]));
  return transition.motions.filter(m => !m.exiting || t < 1).map(m => {
    const node = live.get(m.node.id) ?? m.node;
    const localProgress = transition.gapEnd > 0
      ? m.entering ? clamp((t - transition.gapEnd) / (1 - transition.gapEnd)) : clamp(t / transition.gapEnd)
      : t;
    const ease = 1 - (1 - localProgress) ** 3;
    return { ...node,
      position: { x: m.from.x + (m.to.x - m.from.x) * ease, y: m.from.y + (m.to.y - m.from.y) * ease },
      style: { ...node.style, opacity: m.opacity + ((m.exiting ? 0 : 1) - m.opacity) * ease },
      data: { ...node.data, history: m.exiting, change: m.exiting ? 'removed' : m.entering && t < 1 ? 'inserted' : node.data.change },
      ...(m.exiting ? { draggable: false, selectable: false, focusable: false } : {}),
    };
  });
}
