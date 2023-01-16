import { BaseConstructor } from "../class/BaseConstructor";
import { FactoryFunction } from "../types/dash/Factory";
declare const FactoryMaker: {
    readonly __factoryMap: {
        [props: string]: FactoryFunction;
    };
    getClassFactory<T>(classConstructor: BaseConstructor<T>): FactoryFunction;
    merge<T_1>(classConstructor: BaseConstructor<T_1>, context: object, args: any[]): T_1;
};
export default FactoryMaker;
