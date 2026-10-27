import { IRange } from "../../common/range/Range.ts";
import { CodeSnippet } from "../codegenerator/CodeSnippet.ts";
import { JavaBaseModule } from "../module/JavaBaseModule.ts";
import { ClassClass } from "../runtime/system/ClassClass.ts";
import { NonPrimitiveType } from "./NonPrimitiveType.ts";

export abstract class JavaTypeWithInstanceInitializer extends NonPrimitiveType {

    instanceInitializer: CodeSnippet[] = [];

    private classObject: ClassClass;


    constructor(identifier: string, identifierRange: IRange, path: string, module: JavaBaseModule) {

        super(identifier, identifierRange, path, module);
        this.initClassObject();
    }

    initClassObject() {
        this.classObject = new ClassClass(this);
    }

    getClassObject(): ClassClass {
        return this.classObject;
    }



}
