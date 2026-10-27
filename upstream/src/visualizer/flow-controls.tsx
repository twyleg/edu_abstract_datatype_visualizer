import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { ControlButton, Controls, Panel } from '@xyflow/react';
import { getAnimationSpeed, setAnimationSpeed, subscribeAnimationSpeed } from './animation-speed';
import { TRANSITION_MS } from './flow-animation';
import { chooseVisualizer, getVisualizerUI, subscribeVisualizerUI } from './visualizer-ui';
import { snapshotHistory } from './snapshot-history';

export function FlowControls() {
  const [open, setOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const lastControl = useRef('animation-settings');
  const dock = useRef<HTMLDivElement>(null);
  const speed = useSyncExternalStore(subscribeAnimationSpeed, getAnimationSpeed);
  const multiplier = speed.toLocaleString('de-DE');
  const seconds = (TRANSITION_MS / speed / 1000).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  useEffect(() => { document.documentElement.style.setProperty('--animation-pulse-duration', `${TRANSITION_MS / speed}ms`); }, [speed]);
  useEffect(() => {
    if (!open && !infoOpen) return;
    const outside = (event: PointerEvent) => { if (!dock.current?.contains(event.target as Node)) { setOpen(false); setInfoOpen(false); } };
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') { setOpen(false); setInfoOpen(false); dock.current?.querySelector<HTMLButtonElement>(`button[aria-controls="${lastControl.current}"]`)?.focus(); } };
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', escape);
    return () => { document.removeEventListener('pointerdown', outside); document.removeEventListener('keydown', escape); };
  }, [open, infoOpen]);
  return <div ref={dock} className="nodrag nopan nowheel">
    <Controls orientation="horizontal" showInteractive={false}>
      <ControlButton onClick={() => { lastControl.current='animation-settings'; setInfoOpen(false); setOpen(!open); }} title="Animationsgeschwindigkeit einstellen"
        aria-label="Animationsgeschwindigkeit einstellen" aria-expanded={open} aria-controls="animation-settings">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M3 6h18M3 12h18M3 18h18"/><circle cx="8" cy="6" r="2"/><circle cx="16" cy="12" r="2"/><circle cx="10" cy="18" r="2"/>
        </svg>
      </ControlButton>
      <ControlButton onClick={() => { lastControl.current='site-information'; setOpen(false); setInfoOpen(!infoOpen); }}
        title="Datenschutz und Quelltext" aria-label="Datenschutz und Quelltext" aria-controls="site-information" aria-expanded={infoOpen}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 10v7M12 6v1"/></svg>
      </ControlButton>
    </Controls>
    {infoOpen && <Panel position="bottom-left" className="animation-settings speed-popup site-information" id="site-information" role="region" aria-label="Datenschutz und Quelltext">
      <a href="./privacy.html" target="_blank" rel="noreferrer">Datenschutz und lokale Verarbeitung ↗</a>
      <a href="./source.zip" download>Quelltext dieser veröffentlichten Version</a>
      <a href="./LICENSE.txt" target="_blank" rel="noreferrer">GNU GPL v3 · Lizenz ↗</a>
    </Panel>}
    {open && <Panel position="bottom-left" className="animation-settings speed-popup" id="animation-settings" role="region" aria-label="Animationseinstellungen">
      <label htmlFor="animation-speed">Animationsgeschwindigkeit <output id="animation-speed-value" htmlFor="animation-speed">{multiplier}× · {seconds} s</output></label>
      <input autoFocus id="animation-speed" type="range" min="0.25" max="3" step="0.25" value={speed}
        onChange={event => setAnimationSpeed(event.currentTarget.valueAsNumber)} aria-describedby="animation-speed-help"
        aria-valuetext={`${multiplier}-fache Geschwindigkeit, ${seconds} Sekunden pro Übergang`} />
      <div className="speed-scale"><span>Langsam · 0,25×</span><span>Schnell · 3×</span></div>
      <small id="animation-speed-help">Nur die Darstellung; die Programmausführung bleibt unverändert.</small>
      <ArrayAdapterSettings />
    </Panel>}
  </div>;
}

function ArrayAdapterSettings() {
  const ui = useSyncExternalStore(subscribeVisualizerUI, getVisualizerUI);
  const [adapter, setAdapter] = useState(ui.adapter);
  return <details className="adapter-settings"><summary>Eigener Array-Adapter</summary>
    <form onSubmit={event => { event.preventDefault(); chooseVisualizer({ adapter }); }}>
      {([['type','Klassenname'],['array','Arrayfeld'],['size','Größenfeld (optional)']] as const).map(([key,label]) => <label key={key} htmlFor={`adapter-${key}`}>
        {label}<input id={`adapter-${key}`} value={adapter[key]} onChange={event => setAdapter({...adapter,[key]:event.target.value})} />
      </label>)}
      <button type="submit">Übernehmen</button>
    </form>
  </details>;
}

export function HistoryControls() {
  const history = useSyncExternalStore(snapshotHistory.subscribe, snapshotHistory.getState);
  const ui = useSyncExternalStore(subscribeVisualizerUI, getVisualizerUI);
  const entry = history.entries[history.cursor];
  const end = history.runtimeState === 'stopped' || history.runtimeState === 'error';
  return <Panel position="top-left" className="history-controls nodrag nopan nowheel" aria-label="Visualisierungsverlauf">
    <div className="toolbar-selection">
      <label className="sr-only" htmlFor="mode">Darstellung</label>
      <select id="mode" value={ui.mode} onChange={event => chooseVisualizer({mode:event.currentTarget.value as 'abstract'|'internal'})}>
        <option value="abstract">Abstrakte Sicht</option><option value="internal">Interner Speicher</option>
      </select>
      <label className="sr-only" htmlFor="container">Containerinstanz</label>
      <select id="container" value={ui.selected} disabled={!ui.containers.length} onChange={event=>chooseVisualizer({selected:event.currentTarget.value})}>
        {!ui.containers.length&&<option value="">Kein Container</option>}
        {ui.containers.map(container=><option key={container.id} value={container.id}>{container.label}</option>)}
      </select>
    </div>
    <div className="history-transport">
      <div className="history-buttons">
        <button onClick={snapshotHistory.back} disabled={history.cursor < 1} title="Vorheriger aufgezeichneter Schritt" aria-label="Vorheriger Schritt">←</button>
        <button onClick={snapshotHistory.forward} disabled={history.cursor < 0 || history.cursor >= history.entries.length - 1} title="Nächsten aufgezeichneten Schritt wiedergeben" aria-label="Nächster Schritt wiedergeben">→</button>
        <button onClick={snapshotHistory.replay} disabled={history.cursor < 1} title="Diesen Übergang erneut animieren" aria-label="Schritt erneut abspielen">↻</button>
        <button onClick={snapshotHistory.live} disabled={history.following} title="Zur aktuellen Ausführung zurückkehren">Live</button>
        <span>{entry ? `Schritt ${entry.step}/${history.total}` : 'Noch keine Schritte'}</span>
      </div>
      <input id="replay-position" type="range" min={0} max={Math.max(0,history.entries.length-1)} step={1}
        value={Math.max(0,history.cursor)} disabled={history.entries.length<2} aria-label="Wiedergabeposition"
        aria-valuetext={entry?`Schritt ${entry.step} von ${history.total}`:'Noch keine Schritte'}
        onChange={event=>snapshotHistory.seek(event.currentTarget.valueAsNumber)} />
    </div>
    <div className="toolbar-context">
      <span id="state" title={!history.following?'Rückblick · nur Visualisierung':end&&entry?'Programmende · letzter Zustand':'Live'}>{ui.status}{history.entries[0]?.step>1?' · letzte 2000':''}</span>
      <span id="metrics" title={ui.metrics}>{ui.metrics}</span>
      {!!ui.messages.length&&<span className="runtime-warning" role="status" title={ui.messages.join(' ')} aria-label={ui.messages.join(' ')}>!</span>}
    </div>
  </Panel>;
}
