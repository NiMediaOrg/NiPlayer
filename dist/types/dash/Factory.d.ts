export type FactoryFunction<T> = (context?: object) => {
    create?: (...args: any[]) => T;
    getInstance?: (...args: any[]) => T;
};
export type FactoryObject = {
    [props: string]: any;
};
