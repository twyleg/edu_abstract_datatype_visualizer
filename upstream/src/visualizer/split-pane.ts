/** Pointer and keyboard resizing; the IDE supplies its own layout callback. */
export function installSplitPane(onResize: () => void) {
  const workspace = document.getElementById('workspace')!;
  const divider = document.getElementById('workspace-divider')!;
  const editor = document.getElementById('ide-pane')!;
  let ratio = 0.52, dragging = false, frame = 0;
  const limits = () => {
    const width = Math.max(1, workspace.clientWidth - 8);
    return { width, min: Math.min(280 / width, 0.3), max: 1 - Math.min(320 / width, 0.3) };
  };
  const update = (value: number) => {
    const { min, max, width } = limits(); ratio = Math.max(min, Math.min(max, value));
    workspace.style.setProperty('--editor-width', `${ratio * width}px`);
    divider.setAttribute('aria-valuemin', String(Math.round(min * 100)));
    divider.setAttribute('aria-valuemax', String(Math.round(max * 100)));
    divider.setAttribute('aria-valuenow', String(Math.round(ratio * 100)));
    divider.setAttribute('aria-valuetext', `Editor ${Math.round(ratio * 100)} %, Visualisierung ${Math.round((1 - ratio) * 100)} %`);
  };
  divider.addEventListener('pointerdown', event => {
    if (event.button !== 0) return;
    event.preventDefault(); divider.focus(); divider.setPointerCapture(event.pointerId); dragging = true;
    document.documentElement.classList.add('resizing-panes');
  });
  divider.addEventListener('pointermove', event => {
    if (dragging) update((event.clientX - workspace.getBoundingClientRect().left - 4) / limits().width);
  });
  const end = () => { dragging = false; document.documentElement.classList.remove('resizing-panes'); };
  divider.addEventListener('pointerup', end); divider.addEventListener('pointercancel', end); divider.addEventListener('lostpointercapture', end);
  divider.addEventListener('keydown', event => {
    const delta = (event.shiftKey ? 60 : 20) / limits().width;
    if (event.key === 'ArrowLeft') update(ratio - delta);
    else if (event.key === 'ArrowRight') update(ratio + delta);
    else if (event.key === 'Home') update(limits().min);
    else if (event.key === 'End') update(limits().max);
    else return;
    event.preventDefault();
  });
  const observer = new ResizeObserver(() => {
    update(ratio); cancelAnimationFrame(frame); frame = requestAnimationFrame(onResize);
  });
  observer.observe(workspace); observer.observe(editor); update(ratio);
}
