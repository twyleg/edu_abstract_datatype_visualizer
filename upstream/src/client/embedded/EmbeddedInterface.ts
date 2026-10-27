import type { editor } from 'monaco-editor';
import { SchedulerState } from '../../compiler/common/interpreter/SchedulerState';
import { subscribe, type Snapshot } from '../../visualizer/runtime';
import type { IThrowable } from "../../compiler/common/interpreter/ThrowableType";
import type { RuntimeExceptionClass } from "../../compiler/java/runtime/system/javalang/RuntimeException";
import { GUIFile } from "../workspace/File";
import { MainEmbedded } from "./MainEmbedded";

export type ExitStatus = {
    exitCode: number;
    output: string;
    exception?: IThrowable;
    testProgress?: TestProgress;   
}

export type OnRunExitListener = (exitStatus: ExitStatus) => void;

interface IDEFileAccess {
    getName(): string;
    getText(): string;
}

interface IDEStatusAccess {
    registerOnRunExitListener(listener: OnRunExitListener): void;
}

interface SingleIDEAccess {
    subscribeDebugger(listener: (snapshot: Snapshot) => void): () => void;
    setHistoryLocation(location?: { file: string; line: number }): void;
    layoutEditor(): void;
    getFiles(): IDEFileAccess[];
    registerOnRunExitListener(listener: OnRunExitListener): void;
}

interface OnlineIDEAccess {
    getIDE(id: string): SingleIDEAccess | undefined;
}


/** Implementation classes */

export class IDEFileAccessImpl implements IDEFileAccess {
    constructor(private file: GUIFile){

    }

    getName(): string {
        return this.file.name;
    }
    getText(): string {
        return this.file.getText();
    }

    
}

export class SingleIDEAccessImpl implements SingleIDEAccess {
    layoutEditor(): void { this.ide.getMainEditor().layout(); }

    private historyMarker?: { model: editor.ITextModel; ids: string[]; file: string; line: number; version: number };

    /** UI-only decoration, independently owned from the interpreter's program pointer. */
    setHistoryLocation(location?: { file: string; line: number }): void {
        if (!this.ide.config.enableDebuggerAccess) throw new Error('Debugger access is disabled');
        const old = this.historyMarker;
        if (location && old && !old.model.isDisposed() && old.file === location.file && old.line === location.line && old.version === old.model.getVersionId()) return;
        if (old && !old.model.isDisposed()) old.model.deltaDecorations(old.ids, []);
        this.historyMarker = undefined;
        if (!location) {
            if (!old) return;
            // Monaco removes editor-owned decorations when switching models. Restore
            // the real pointer through its existing manager, without firing a step event.
            const interpreter = this.ide.getInterpreter();
            const manager = interpreter.programPointerManager;
            const position = interpreter.scheduler.getNextStepPosition();
            if (old && interpreter.scheduler.state === SchedulerState.paused && position?.range && manager?.keyToDecorationsMap.has('ProgramPointer')) {
                manager.show(position, {
                    key: 'ProgramPointer', isWholeLine: true, className: 'jo_revealProgramPointer',
                    rulerColor: '#6fd61b', minimapColor: '#6fd61b',
                    beforeContentClassName: interpreter.showTriangleAtProgramPointer ? 'jo_revealProgramPointerBefore' : undefined
                });
            }
            return;
        }
        if (!Number.isInteger(location.line) || location.line < 1) return;
        const file = this.ide.getCurrentWorkspace().getFiles().find(file => file.name === location.file);
        const model = file?.getMonacoModel();
        if (!file || !model || model.isDisposed() || location.line > model.getLineCount()) return;
        const ids = model.deltaDecorations([], [{
            range: { startLineNumber: location.line, startColumn: 1, endLineNumber: location.line, endColumn: model.getLineMaxColumn(location.line) },
            options: {
                isWholeLine: true, className: 'jo_history_line', linesDecorationsClassName: 'jo_history_gutter', zIndex: 20,
                hoverMessage: { value: 'Aufgezeichneter Haltepunkt · Verlauf (nächste Anweisung)' },
                overviewRuler: { color: '#8ed2ff', position: 2 }
            }
        }]);
        this.historyMarker = { model, ids, file: location.file, line: location.line, version: model.getVersionId() };
        const sourceEditor = this.ide.getMainEditor();
        if (sourceEditor.getModel() !== model) this.ide.setFileActive(file);
        sourceEditor.revealLineInCenterIfOutsideViewport(location.line);
    }


    constructor(private ide: MainEmbedded, private enableFileAccess: boolean, private enableRunExitStatusAccess: boolean){

    }

    subscribeDebugger(listener: (snapshot: Snapshot) => void): () => void {
        if (!this.ide.config.enableDebuggerAccess) throw new Error('Debugger access is disabled');
        return subscribe(this.ide.getInterpreter(), listener);
    }

    getFiles(): IDEFileAccess[] {
        if(!this.enableFileAccess){
            throw new Error("File access is not enabled for this IDE");
        }
        return this.ide.getCurrentWorkspace().getFiles().map(file => new IDEFileAccessImpl(file));        
    }

    registerOnRunExitListener(listener: OnRunExitListener): void {
        if(!this.enableRunExitStatusAccess){
            throw new Error("Run exit status access is not enabled for this IDE");
        }
        this.ide.registerOnRunExitListener(listener);
    }

}

export class OnlineIDEAccessImpl implements OnlineIDEAccess {
    
    private static  ideMap: Map<string, SingleIDEAccessImpl> = new Map();

    public static registerIDE(ide: MainEmbedded){
        OnlineIDEAccessImpl.ideMap.set(ide.config.id!,  
            new SingleIDEAccessImpl(ide, ide.config.enableFileAccess ?? false, ide.config.enableRunExitStatusAccess ?? false));
    }
    
    getIDE(id: string): SingleIDEAccess | undefined {
        return OnlineIDEAccessImpl.ideMap.get(id);
    }

}