import type { Snapshot } from './runtime';

export interface HistoryEntry { step: number; snapshot: Snapshot }
export interface HistoryState {
  entryFile?:string; entries: HistoryEntry[]; cursor: number; following: boolean; runtimeState: Snapshot['state'];
  display?: Snapshot; instant: boolean; total: number;
}
/** Records instruction boundaries and debugger halts, not interpreter checkpoints. */
export class SnapshotHistory {
  private state: HistoryState = { entries: [], cursor: -1, following: true, runtimeState: 'stopped', instant: false, total: 0 };
  private listeners = new Set<() => void>();
  private latestLive?: Snapshot;
  private replayTimer?: ReturnType<typeof setTimeout>;
  constructor(private limit = 2000) {}
  getState = () => this.state;
  subscribe = (listener: () => void) => { this.listeners.add(listener); return () => { this.listeners.delete(listener); }; };
  private notificationPending = false;
  private publish(state: HistoryState, deferred = false) {
    this.state = state;
    if (deferred) {
      if (!this.notificationPending) {
        this.notificationPending = true;
        queueMicrotask(() => { this.notificationPending = false; this.listeners.forEach(listener => listener()); });
      }
    } else this.listeners.forEach(listener => listener());
  }
  private cancelReplay() { if (this.replayTimer !== undefined) clearTimeout(this.replayTimer); this.replayTimer = undefined; }
  accept(snapshot: Snapshot) {
    let old = this.state;
    if (['stopped', 'error'].includes(old.runtimeState) && ['running', 'paused'].includes(snapshot.state)) {
      this.cancelReplay();
      old = { entries: [], cursor: -1, following: true, runtimeState: snapshot.state, instant: false, total: 0 };
    }
    old = {...old, entryFile:old.entryFile ?? snapshot.entryFile ?? snapshot.location?.file};
    if (snapshot.event === 'resume') {
      this.latestLive=snapshot;
      this.cancelReplay();
      this.publish({ ...old, following:true, cursor:old.entries.length-1, display:snapshot, runtimeState:snapshot.state, instant:true });
      return;
    }
    let { entries, cursor, total } = old;
    if ((snapshot.event === 'instruction' || snapshot.state === 'paused') && snapshot.location?.file === old.entryFile && !!snapshot.location) {
      total++;
      entries = [...entries, { step: total, snapshot }];
      const removed = Math.max(0, entries.length - this.limit);
      entries = entries.slice(removed);
      cursor = old.following ? entries.length - 1 : Math.max(0, cursor - removed);
    }
    const terminal = snapshot.state === 'stopped' || snapshot.state === 'error';
    this.latestLive = terminal ? entries.at(-1)?.snapshot : snapshot;
    const display = old.following ? (terminal ? entries.at(-1)?.snapshot : snapshot) : entries[cursor]?.snapshot;
    this.publish({ entryFile:old.entryFile, entries, cursor, total, following: old.following, runtimeState: snapshot.state, display, instant: false }, snapshot.event === 'instruction');
  }
  private show(cursor: number, instant: boolean) {
    if (cursor < 0 || cursor >= this.state.entries.length) return;
    this.publish({ ...this.state, cursor, following: false, display: this.state.entries[cursor].snapshot, instant });
  }
  seek = (cursor: number) => { if (!Number.isInteger(cursor)) return; this.cancelReplay(); this.show(cursor, true); };
  back = () => { this.cancelReplay(); this.show(this.state.cursor - 1, true); };
  forward = () => { this.cancelReplay(); this.show(this.state.cursor + 1, false); };
  live = () => {
    this.cancelReplay();
    this.publish({ ...this.state, cursor: this.state.entries.length - 1, following: true, display: this.latestLive ?? this.state.entries.at(-1)?.snapshot, instant: true });
  };
  replay = () => {
    this.cancelReplay();
    const target = this.state.entries[this.state.cursor];
    if (this.state.cursor < 1 || !target) return;
    this.show(this.state.cursor - 1, true);
    // Let React commit the previous state before animating the recorded transition.
    this.replayTimer = setTimeout(() => {
      this.replayTimer = undefined;
      const index = this.state.entries.indexOf(target);
      if (index >= 0) this.show(index, false);
    }, 120);
  };
}
export const snapshotHistory = new SnapshotHistory();
