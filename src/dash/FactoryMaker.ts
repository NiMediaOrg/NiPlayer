import { BaseConstructor } from "../class/BaseConstructor"
import { FactoryFunction } from "../types/dash/Factory";

const FactoryMaker = (function() {
    class FactoryMaker {
        readonly __factoryMap: {[props:string]: FactoryFunction};
        constructor() {
            this.__factoryMap = {};
        }

        getClassFactory<T>(classConstructor: BaseConstructor<T>): FactoryFunction {
            let factory = this.__factoryMap[classConstructor.name];
            let ctx = this;
            if(!factory) {
                // context为调用factory函数时传入的上下文，也就是函数的执行环境
                factory = function(context?: object) {
                    if(!context) context = {};
                    return {
                        create(...args: any[]) {
                            return ctx.merge<T>(classConstructor,context,args);
                        }
                    }
                }
                this.__factoryMap[classConstructor.name] = factory;
            }
            return factory;
        }

        merge<T>(classConstructor: BaseConstructor<T>, context: object, args:any[]): T {
            let extensionObject = context[classConstructor.name];
            if(extensionObject) {

            } else {
                return new classConstructor(context,...args);
            }
        }

    }

    return new FactoryMaker();
})()

export default FactoryMaker;