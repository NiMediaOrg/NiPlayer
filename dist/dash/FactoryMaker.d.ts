import { BaseConstructor } from "../class/BaseConstructor";
import { FactoryFunction, FactoryObject } from "../types/dash/Factory";
declare const FactoryMaker: {
    __class_factoryMap: {
        [props: string]: FactoryFunction<any>;
    };
    __single_factoryMap: {
        [props: string]: FactoryFunction<any>;
    };
    __single_instanceMap: {
        [props: string]: any;
    };
    getClassFactory<T>(classConstructor: BaseConstructor<T>): FactoryFunction<T>;
    getSingleFactory<T_1>(classConstructor: BaseConstructor<T_1>): FactoryFunction<T_1>;
    merge<T_2>(classConstructor: BaseConstructor<T_2>, context: FactoryObject, ...args: any[]): T_2;
};
export default FactoryMaker;
