export function $warn(msg:string): never {
    throw new Error(msg);
}