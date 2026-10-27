import { WebworkerWrapper } from '../../../tools/webworker/WebworkerWrapper';
import { JavaWebWorkerCompiler } from './JavaWebworkerCompiler';
import workerUrl from './JavaWebworkerCompiler?worker&url';


export class JavaWebworkerCompilerController {
    
    javaWebworkerCompiler: JavaWebWorkerCompiler;

    constructor(){
        const worker = new Worker(workerUrl, {type: 'module'});
        this.javaWebworkerCompiler = new WebworkerWrapper<JavaWebWorkerCompiler>(worker, this).getWrapper();
    }


}