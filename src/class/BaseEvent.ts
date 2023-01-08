import { EventObject } from "../types/EventObject";

export class BaseEvent {
  $events: EventObject = {};
  constructor() {}

  //事件触发
  emit(event: string, ...args: any[]) {
    if (this.$events[event]) {
      this.$events[event].forEach((cb) => {
        cb.call(this, ...args);
      });
    }
  }

  //事件监听
  on(event: string, cb: Function) {
    this.$events[event] = this.$events[event] || [];
    this.$events[event].push(cb);
  }
}
