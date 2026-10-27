import { JRC } from "../../language/JavaRuntimeLibraryComments.ts";
import { LibraryDeclarations } from "../../module/libraries/DeclareType.ts";
import { NonPrimitiveType } from "../../types/NonPrimitiveType.ts";
import { ObjectClass } from "./javalang/ObjectClassStringClass.ts";

export class ClassClass extends ObjectClass {
    static __javaDeclarations: LibraryDeclarations = [
        { type: "declaration", signature: "class Class<T>", comment: JRC.classClassComment },

        // from IterableInterface
        { type: "method", signature: "string getName()", native: ClassClass.prototype._getName, comment: JRC.classGetNameComment },
    ];

    static type: NonPrimitiveType;


    constructor(public type: NonPrimitiveType){
        super();
    }

    _getName(): string {
        return this.type.identifier;
    }


}