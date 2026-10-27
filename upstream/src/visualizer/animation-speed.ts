/** Shared display preference; changing it never touches the interpreter. */
let speed = 1;
const listeners = new Set<() => void>();
export const getAnimationSpeed = () => speed;
export function subscribeAnimationSpeed(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}
export function setAnimationSpeed(value: number) {
  if (!Number.isFinite(value)) return;
  const next = Math.max(0.25, Math.min(3, value));
  if (next === speed) return;
  speed = next;
  listeners.forEach(listener => listener());
}
