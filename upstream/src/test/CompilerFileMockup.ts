
export type FileContentChangedListener = (changedfile: CompilerFileMockup) => void;

export class CompilerFileMockup {

    /**
     * filename == "" for test files
     */
    public name: string;

    private lastSavedMonacoVersion: number = -1;

    private fileContentChangedListeners: FileContentChangedListener[] = [];


    /*
     * monaco editor counts LanguageChangedListeners and issues ugly warnings in console if more than
     * 200, 300, ... are created. Unfortunately it creates one each time a monaco.editor.ITextModel is created.
     * To keep monaco.editor.ITextModel instance count low we instantiate it only when needed and dispose of it
     * when switching to another workspace. Meanwhile we store file text here:
     */
    private __textWhenMonacoModelAbsent: string = "";
    private storedMonacoModelVersion: number = 0;


    constructor(name?: string) {
        this.name = name || "";
    }

    getText() {
            return this.__textWhenMonacoModelAbsent;
    }

    setText(text: string) {
            this.__textWhenMonacoModelAbsent = text;

        this.notifyListeners();
    }

    getMonacoVersion(): number {
            return this.storedMonacoModelVersion;
    }

    isSaved(): boolean {
        return this.lastSavedMonacoVersion == this.getMonacoVersion();
    }

    setSaved(isSaved: boolean) {
        if (isSaved) {
            this.lastSavedMonacoVersion = this.getMonacoVersion();
        } else {
            this.lastSavedMonacoVersion = -1;
        }
    }

    onFileContentChanged(listener: FileContentChangedListener) {
        this.fileContentChangedListeners.push(listener);
    }

    private notifyListeners() {
        for (let listener of this.fileContentChangedListeners) {
            listener(this);
        }
    }

    hasMonacoModel(): boolean {
        return false;
    }
}