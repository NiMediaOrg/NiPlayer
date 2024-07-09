function isNative(Ctor: any) {
    return typeof Ctor === 'function' && /native code/.test(Ctor.toString())
}

// 优雅降级实现Vue中的nextTick功能
export function nextTick(cb: (...args) => any) {
    if (typeof Promise !== 'undefined' && isNative(Promise)) {
        Promise.resolve().then(cb())
    } else if (
        typeof MutationObserver !== 'undefined' &&
        isNative(MutationObserver) &&
        MutationObserver.toString() === '[object MutationObserverConstructor]'
    ) {
        let observer = new MutationObserver(cb)
        let count = 1
        let node = document.createTextNode(String(count))
        observer.observe(node, {
            characterData: true,
        })
        count++
        node.data = String(count)
    } else {
        setTimeout(() => cb())
    }
}
