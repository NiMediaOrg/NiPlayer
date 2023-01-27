import { ComponentItem } from "../types/Player";

export const CONTROL_COMPONENT_STORE = new Map<string,ComponentItem>();
export const PROGRESS_COMPONENT_STORE = new Map<string,ComponentItem>();

export function storeControlComponent(item:ComponentItem) {
    CONTROL_COMPONENT_STORE.set(item.id,item);
}

export function storeProgressComponent(item:ComponentItem) {
    PROGRESS_COMPONENT_STORE.set(item.id,item);
}