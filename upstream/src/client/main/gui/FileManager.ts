import { IFilesManager } from "../../../compiler/common/interpreter/IFilesManager";
import { CompilerFile } from "../../../compiler/common/module/CompilerFile";
import { FileNotFoundExceptionClass } from "../../../compiler/java/runtime/system/javalang/FileNotFoundException";
import { MainBase } from "../MainBase";

export class FileManager implements IFilesManager {

    constructor(public main: MainBase){

    }

    read(filename: string): string {
        let file = this.getFile(filename);
        return file.getText();
    }

    write(filename: string, content: string): void {
        let file = this.getFile(filename);
        file.setText(content);
    }

    append(filename: string, content: string): void {
        let file = this.getFile(filename);
        file.setText(file.getText() + content);
    }

    getFile(filename: string): CompilerFile {
        let file = this.main.getCurrentWorkspace()?.getFiles().find(f => f.name == filename);
        if(!file){
            throw new FileNotFoundExceptionClass(filename);
        }

        return file;
    }

}