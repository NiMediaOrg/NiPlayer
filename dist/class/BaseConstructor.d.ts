export interface BaseConstructor<T> {
    new (context: object, ...args: any[]): T;
    name: string;
}
