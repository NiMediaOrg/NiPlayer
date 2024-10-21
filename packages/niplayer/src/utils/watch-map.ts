import { createEffect } from "solid-js";

export function watchMap<K, V>(targetFn: () => Map<K, V>, callback: {
    add?: (task: V) => void,
    update?: (task: V) => void,
}) {
    let previousMap = null;
    createEffect(() => {
        const target = targetFn();
        if (!target || target.size === 0) return;
        if (previousMap) {
            //todo 此处需要比较前后target的diff，决定task的添加和更新
        } else {
            if (callback.add) {
                for (let [k, v] of target.entries()) {
                    callback.add(v);
                }
            } 
        }

        previousMap = new Map(Object.entries(target));
    })
}