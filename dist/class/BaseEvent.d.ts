import { EventObject } from "../types/EventObject";
export declare class BaseEvent {
    $events: EventObject;
    constructor();
    emit(event: string, ...args: any[]): void;
    on(event: string, cb: Function): void;
}
