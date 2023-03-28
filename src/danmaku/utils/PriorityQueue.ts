import { DanmakuData } from "@/types/danmaku";

export class PriorityQueue<T extends DanmakuData> {
  readonly queue: T[];
  private newestTime: number = 0;
  private maxInterval: number = 5;
  constructor() {
    this.queue = [];
  }

  // 清理过期数据
  private removeOutTimeData() {
    this.queue.filter((value, index) => {
      return this.newestTime - value.timestamp <= this.maxInterval;
    });
  }

  // 添加新的数据
  add(data: T) {
    this.newestTime = data.timestamp;

    this.queue.unshift(data);

    // 清除过期的数据
    this.removeOutTimeData();

    return this;
  }
 
  // 直接将数据添加到缓冲队列的末尾
  push(data:T) {
    this.queue.push(data)
    return this;
  }

  // 弹出队列的首个数据
  shift(): T {
    return this.queue.shift();
  }

  splice(index: number,number: number) {
    this.queue.splice(index,number);

    return this;
  }

  clear() {
    while (this.queue.length) {
      this.queue.pop();
    }

    return this;
  }

  forEach(cb: (value: T, index: number) => void) {
    for(let index = 0 ;index <this.queue.length;index++) {
        cb(this.queue[index], index);
    }
  }

  get length() {
    return this.queue.length;
  }
}
