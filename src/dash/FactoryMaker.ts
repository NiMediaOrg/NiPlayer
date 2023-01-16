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
                // 如果获取到的上下文的属性classConstructor.name对应的对象上具有覆写（override）属性，则意味着需要覆写classConstructor上对应的属性
                if(extensionObject.override) {
                    let instance = new classConstructor({context},...args);
                    let override = new extensionObject.instance({
                        context,
                        parent:instance
                    })

                    for(let props in override) {
                        if(instance.hasOwnProperty(props)) {
                            instance[props] = parent[props];
                        }
                    }
                } else {// 如果不需要覆写，则意味着直接拿context中传入的构造函数来替换这个构造函数
                    return new extensionObject.instance({
                        context,
                    })
                }
            } else {
                return new classConstructor({context},...args);
            }
        }
    }

    return new FactoryMaker();
})()

export default FactoryMaker;