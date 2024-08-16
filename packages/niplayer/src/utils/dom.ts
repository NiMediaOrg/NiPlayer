export function checkPathContainDom(path: HTMLElement[], target: HTMLElement): boolean {
    for (let i = path.length - 1; i >= 0; i--) {
        if (path[i] === target) return true;
    }

    return false;
}