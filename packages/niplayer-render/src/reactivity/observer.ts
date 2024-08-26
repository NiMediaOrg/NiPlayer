import { nextTick } from "../utils/next-tick";
import { autorun } from "./effects";

export type Observer = () => void;
export const effectCallbackStack: Observer[] = [];

export const observableMap: Map<Record<string, any>, Map<string, Set<Observer>>> = new Map();
const taskQueue: Set<Observer> = new Set();

let pending = false;

function flushScheduleQueue() { //实现视图的异步更新
    taskQueue.forEach(fn => autorun(fn));
    taskQueue.clear();
    pending = false;
}

export function observable(object: Record<string, any>) {
    return new Proxy(object, {
        get(target, key: string) {
            if (!observableMap.has(target)) observableMap.set(target, new Map());
            const map = observableMap.get(target);
            if (!map.has(key)) map.set(key, new Set());
            const effectCallback = effectCallbackStack[0];
            if (effectCallback) {
                map.get(key)?.add(effectCallback);
            }
            return target[key];
        },
        set(target, key: string, value) {
            if (target[key] === value) return true;
            const map = observableMap.get(target);
            if (!map) {
                target[key] = value;
                return true;
            };
            const effects = map.get(key);
            
            if (effects) {
                effects.forEach(fn => {
                    taskQueue.add(fn);
                });
            }

            // flushScheduleQueue();
            if (!pending) {
                pending = true;
                nextTick(() => flushScheduleQueue);
            }

            target[key] = value;
            map.delete(key);            
            return true;
        }
    })
}