import { CallbackFunction } from "../../../../common/interpreter/StepFunction.ts";
import { Thread } from "../../../../common/interpreter/Thread.ts";
import { LibraryDeclarations } from "../../../module/libraries/DeclareType.ts";
import { NonPrimitiveType } from "../../../types/NonPrimitiveType.ts";
import { ConsumerInterface } from "../functional/ConsumerInterface.ts";
import { FunctionInterface } from "../functional/FunctionInterface.ts";
import { PredicateInterface } from "../functional/PredicateInterface.ts";
import { ObjectClass, ObjectClassOrNull } from "../javalang/ObjectClassStringClass.ts";

export class SystemStreamClass extends ObjectClass {

    static __javaDeclarations: LibraryDeclarations = [
        { type: "declaration", signature: "private class SystemStream<T> implements Stream<T>" },
        { type: "method", signature: "Object[] toArray()", java: SystemStreamClass.prototype._mj$toArray$Object_I$ },
        { type: "method", signature: "long count()", java: SystemStreamClass.prototype._mj$count$long$ },
        { type: "method", signature: "void forEach(Consumer<? super T> action)", java: SystemStreamClass.prototype._mj$forEach$void$Consumer },
        { type: "method", signature: "Stream<T> filter(Predicate<? super T> predicate)", java: SystemStreamClass.prototype._mj$filter$Stream$Predicate },
        { type: "method", signature: "<R> Stream<R> map(Function<? super T, R> mapper)", java: SystemStreamClass.prototype._mj$map$Stream$Function },

    ]

    static type: NonPrimitiveType;

    protected elements: ObjectClassOrNull[] = [];

    constructor(elements?: ObjectClassOrNull[]) {
        super();
        this.elements = elements || [];
    }

    _mj$count$long$(t: Thread, callback: CallbackFunction) {
        t.s.push(this.elements.length);
        if(callback) callback();
     };

    _mj$toArray$Object_I$(t: Thread, callback: CallbackFunction) {
        t.s.push(this.elements.slice());
        if(callback) callback();
     };

    _mj$forEach$void$Consumer(t: Thread, callback: CallbackFunction, consumer: ConsumerInterface) {
        let index: number = -1;

        let f = () => {
            index++;
            if (index < this.elements.length) {
                consumer._mj$accept$void$T(t, f, this.elements[index]);
            } else {
                if (callback) callback();
            }
        }

        f();

    }

    _mj$map$Stream$Function(t: Thread, callback: CallbackFunction, mapper: FunctionInterface) {
        let mapped: ObjectClassOrNull[] = [];
    
        let index: number = -1;

        let f = () => {
            index++;
            if (index < this.elements.length) {
                let element = this.elements[index];
                
                mapper._mj$apply$F$E(t, () => {
                    mapped.push(t.s.pop());
                    f();
                }, element);
            } else {
                t.s.push(new SystemStreamClass(mapped));
                if (callback) callback();
            }
        }

        f();

    }

    _mj$filter$Stream$Predicate(t: Thread, callback: CallbackFunction, predicate: PredicateInterface) {
        let filteredElements: ObjectClassOrNull[] = [];
    
        let index: number = -1;

        let f = () => {
            index++;
            if (index < this.elements.length) {
                let element = this.elements[index];
                predicate._mj$test$boolean$T(t, () => {
                    if(t.s.pop()) filteredElements.push(element);
                    f();
                }, element);
            } else {
                t.s.push(new SystemStreamClass(filteredElements));
                if (callback) callback();
            }
        }

        f();

    }


}