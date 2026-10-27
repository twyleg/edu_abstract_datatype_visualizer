import { IMain } from "../IMain";
import { CompilerFile } from "./CompilerFile";
import { Module } from "./Module";


export abstract class CompilerWorkspace {


    constructor(public name: string) {

    }

    abstract getFiles(): CompilerFile[];


    getIdentifier(): string {
        return this.name;
    }
}
