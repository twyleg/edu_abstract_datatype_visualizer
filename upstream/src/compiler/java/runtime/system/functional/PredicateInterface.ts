import { CallbackFunction } from "../../../../common/interpreter/StepFunction.ts";
import { Thread } from "../../../../common/interpreter/Thread.ts";
import { LibraryDeclarations } from "../../../module/libraries/DeclareType.ts";
import { NonPrimitiveType } from "../../../types/NonPrimitiveType.ts";
import { InterfaceClass } from "../javalang/InterfaceClass.ts";
import { ObjectClass } from "../javalang/ObjectClassStringClass.ts";

export class PredicateInterface extends InterfaceClass {
    static __javaDeclarations: LibraryDeclarations = [
        {type: "declaration", signature: "interface Predicate<T>"},
        {type: "method", signature: "boolean test(T t)", java: PredicateInterface.prototype._mj$test$boolean$T},
    ]

    static type: NonPrimitiveType;

    _mj$test$boolean$T(t: Thread, callback: CallbackFunction, element: ObjectClass){}

}