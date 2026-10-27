import { JavaClass } from "../../compiler/java/types/JavaClass";
import { JavaEnum } from "../../compiler/java/types/JavaEnum";
import { JavaField } from "../../compiler/java/types/JavaField";
import { JavaInterface } from "../../compiler/java/types/JavaInterface";
import { JavaMethod } from "../../compiler/java/types/JavaMethod";

export abstract class APIPrinter {

    abstract printClassEnumInterface(cei: JavaClass | JavaEnum | JavaInterface): string;
    abstract printField(field: JavaField): string;
    abstract printMethod(method: JavaMethod): string;

    wrap(s: string): string {
        if(typeof s == 'undefined') return "";
        return s.replace(
            /(?![^\n]{1,128}$)([^\n]{1,128})\s/g, '$1\n'
        );
    }

    toJavaDocComment(comment: string | (() => string), indent: string){
        if(!comment) return "";
        if(typeof comment == "function") comment = comment();
        let s = indent + "/**\n"
        s += indent + " * " + this.wrap(comment).replaceAll(/\n/g, "\n" + indent + " * ")
        s += "\n" + indent + " **/\n"
        return s;
    }
}