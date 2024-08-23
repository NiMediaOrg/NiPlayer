function defaultCompare<T extends Record<string, any>>(a: T, b: T): boolean {
    return a.y < b.y;
}
// 使用二分查找实现优先队列
export class PriorityQueue<T extends Record<string, any>> {
    public array: T[] = [];

    constructor(private compare: (a: T, b: T) => boolean = defaultCompare) {}

    push(item: T) {
        let left = 0, right = this.array.length;
        while (left < right) {
            const mid = Math.floor((left + right) / 2);
            if (this.compare(item, this.array[mid])) {
                right = mid;
            } else {
                left = mid + 1;
            }
        }
        this.array.splice(left, 0, item);
    }

    delete(val: T) {
        const index = this.array.indexOf(val);
        if (index!== -1) {
            this.array.splice(index, 1);
        }
    }

    forEach(cb: (val: T, index: number) => void) {
        this.array.forEach((val, index) => cb(val, index));
    }

    some(cb: (val: T, index: number) => boolean) {
        return this.array.some(cb)
    }

    size() {
        return this.array.length;
    }
}


