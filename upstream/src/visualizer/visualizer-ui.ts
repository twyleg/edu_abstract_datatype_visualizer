export interface VisualizerUI {
  mode: 'abstract' | 'internal'; selected: string;
  containers: { id: string; label: string }[];
  status: string; metrics: string; messages: string[];
  adapter: { type: string; array: string; size: string };
}
let state: VisualizerUI = {
  mode: 'abstract', selected: '', containers: [], status: 'IDE wird geladen …', metrics: '', messages: [],
  adapter: { type: 'SchulArray', array: 'daten', size: 'anzahl' },
};
const listeners = new Set<() => void>();
const choiceListeners = new Set<() => void>();
export const getVisualizerUI = () => state;
export const subscribeVisualizerUI = (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; };
export const subscribeVisualizerChoices = (listener: () => void) => { choiceListeners.add(listener); return () => { choiceListeners.delete(listener); }; };
export function publishVisualizerUI(update: Partial<VisualizerUI>) {
  state = { ...state, ...update }; listeners.forEach(listener => listener());
}
export function chooseVisualizer(update: Partial<Pick<VisualizerUI, 'mode' | 'selected' | 'adapter'>>) {
  publishVisualizerUI(update); choiceListeners.forEach(listener => listener());
}
