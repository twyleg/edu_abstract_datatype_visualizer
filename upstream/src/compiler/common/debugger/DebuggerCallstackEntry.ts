import { DebM } from "./DebuggerMessages";
import { BaseSymbolTable } from "../BaseSymbolTable";
import { Program } from "../interpreter/Program";
import { Step } from "../interpreter/Step";
import { ProgramState } from "../interpreter/ProgramState";
import { IRange } from "../range/Range";

export class DebuggerCallstackEntry {

    program: Program;
    nextStep: Step | undefined;
    range?: IRange;
    symbolTable: BaseSymbolTable | undefined;

    constructor(public programState: ProgramState){
        this.program = programState.program;

        this.symbolTable = this.program.symbolTable;

        this.nextStep = programState.currentStepList[programState.stepIndex];

        if(this.nextStep){
            //@ts-ignore
            this.range = this.nextStep.range;
        }

        if(this.symbolTable && this.nextStep && this.nextStep.range?.startLineNumber && this.nextStep.range?.startColumn){
            this.symbolTable = this.symbolTable.findSymbolTableAtPosition({
                lineNumber: this.nextStep.range.startLineNumber!,
                column: this.nextStep.range.startColumn!
            })
        }
    }

    getCaption(){
        let caption: string = this.program.methodIdentifierWithClass;
        if(caption == ".main") caption = DebM.mainProgram();
        if(this.range && this.range.startLineNumber){
            caption += `:${this.range.startLineNumber}`
        }
        caption = caption.replace(/\d*\./g, ".");
        caption = caption.replaceAll(/\$/g, "");
        return caption;
    }



}