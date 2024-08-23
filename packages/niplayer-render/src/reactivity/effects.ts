import { effectCallbackStack } from "./observer";
export function autorun(cb: () => void) {
    effectCallbackStack.push(cb);
    cb();
    effectCallbackStack.pop();
}