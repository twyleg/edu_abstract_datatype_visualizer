import { BaseWebworker } from "../../../tools/webworker/BaseWebWorker";
import { JavaWebworkerCompilerController } from "./JavaWebworkerCompilerController";

const ctx: DedicatedWorkerGlobalScope = self as any;
// Beware: additional code at end of this file!

export class JavaWebWorkerCompiler extends BaseWebworker<JavaWebworkerCompilerController> {

    constructor(ctx: DedicatedWorkerGlobalScope){
        super(ctx);
        this.run();
    }

    async run(){

    }




}

new JavaWebWorkerCompiler(ctx);

