import { JRC } from "../../../language/JavaRuntimeLibraryComments.ts";
import { CallbackFunction } from "../../../../common/interpreter/StepFunction.ts";
import { Thread } from "../../../../common/interpreter/Thread.ts";
import { LibraryDeclarations } from "../../../module/libraries/DeclareType.ts";
import { NonPrimitiveType } from "../../../types/NonPrimitiveType.ts";
import { InterfaceClass } from "../javalang/InterfaceClass.ts";
import { ObjectClassOrNull } from "../javalang/ObjectClassStringClass.ts";
import { ConsumerInterface } from "../functional/ConsumerInterface.ts";
import { PredicateInterface } from "../functional/PredicateInterface.ts";
import { FunctionInterface } from "../functional/FunctionInterface.ts";

export class StreamInterface extends InterfaceClass {
    static __javaDeclarations: LibraryDeclarations = [
        { type: "declaration", signature: "interface Stream<T>" },
        { type: "method", signature: "Object[] toArray()", java: StreamInterface.prototype._mj$toArray$Object_I$ },
        { type: "method", signature: "long count()", java: StreamInterface.prototype._mj$count$long$ },
        { type: "method", signature: "void forEach(Consumer<? super T> action)", java: StreamInterface.prototype._mj$forEach$void$Consumer },
        { type: "method", signature: "Stream<T> filter(Predicate<? super T> predicate)", java: StreamInterface.prototype._mj$filter$Stream$Predicate },
        { type: "method", signature: "<R> Stream<R> map(Function<? super T, R> mapper)", java: StreamInterface.prototype._mj$map$Stream$Function },

    ]

    static type: NonPrimitiveType;

    _mj$count$long$(t: Thread, callback: CallbackFunction) { };

    _mj$toArray$Object_I$(t: Thread, callback: CallbackFunction) { };

    _mj$forEach$void$Consumer(t: Thread, callback: CallbackFunction, consumer: ConsumerInterface) { }
    
    _mj$filter$Stream$Predicate(t: Thread, callback: CallbackFunction, predicate: PredicateInterface) { }
    
    _mj$map$Stream$Function(t: Thread, callback: CallbackFunction, mapper: FunctionInterface) { }
}