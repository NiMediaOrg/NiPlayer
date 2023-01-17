import { BaseConstructor } from "../class/BaseConstructor";
import { FactoryFunction, FactoryObject } from "../types/dash/Factory";

const FactoryMaker = (function () {
  class FactoryMaker {
    __class_factoryMap: { [props: string]: FactoryFunction<any> };
    __single_factoryMap: { [props:string]: FactoryFunction<any> };
    __single_instanceMap:{ [props:string]: any };
    constructor() {
      this.__class_factoryMap = {};
      this.__single_factoryMap = {};
      this.__single_instanceMap = {};
    }

    getClassFactory<T>(classConstructor: BaseConstructor<T>): FactoryFunction<T> {
      let factory = this.__class_factoryMap[classConstructor.name] as FactoryFunction<T>;
      let ctx = this;
      if (!factory) {
        // context为调用factory函数时传入的上下文，也就是函数的执行环境
        factory = function (context?: FactoryObject) {
          if (!context) context = {};
          return {
            create(...args: any[]) {
              return ctx.merge<T>(classConstructor, context, ...args);
            },
          };
        };
        this.__class_factoryMap[classConstructor.name] = factory;
      }
      return factory;
    }

    getSingleFactory<T>(classConstructor:BaseConstructor<T>): FactoryFunction<T> {
      let factory = this.__single_factoryMap[classConstructor.name];
      let ctx = this;
      if(!factory) {
        factory = function(context) {
          if(!context) context = {}
          return {
            getInstance(...args): T {
              let instance = ctx.__single_instanceMap[classConstructor.name];
              if(!instance) {
                instance = new classConstructor({context},...args);
              }
              return instance;
            },
          }
        }
      }

      return factory;
    }

    merge<T>(
      classConstructor: BaseConstructor<T>,
      context: FactoryObject,
      ...args: any[]
    ): T {
      let extensionObject = context[classConstructor.name];
      if (extensionObject) {
        // 如果获取到的上下文的属性classConstructor.name对应的对象上具有覆写（override）属性，则意味着需要覆写classConstructor上对应的属性
        if (extensionObject.override) {
          let instance = new classConstructor({ context }, ...args);
          let override = new extensionObject.instance({
            context,
            parent: instance,
          });

          for (let props in override) {
            if (instance.hasOwnProperty(props)) {
              instance[props] = parent[props];
            }
          }
        } else {
          // 如果不需要覆写，则意味着直接拿context中传入的构造函数来替换这个构造函数
          return new extensionObject.instance({
            context,
          });
        }
      } else {
        return new classConstructor({ context }, ...args);
      }
    }
  }

  return new FactoryMaker();
})();

export default FactoryMaker;
