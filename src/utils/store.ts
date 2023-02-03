import { FullScreen } from "../component/Controller/parts/FullScreen";
import { PlayButton } from "../component/Controller/parts/PlayButton";
import { Playrate } from "../component/Controller/parts/Playrate";
import { Volume } from "../component/Controller/parts/Volume";
import { ComponentItem } from "../types/Player";
import { checkBuiltInComponentID } from "./typeCheck";

// COMPONENT_STORE存储目前还展示在视图上的组件，也就是没用卸载或者删除的组件
export const COMPONENT_STORE = new Map<string, ComponentItem>();
// ONCE_COMPONENT_STORE存储的是只要曾经在视图上展示过哪怕已经卸载，都会一直保留在此处，除非通过delete进行彻底删除
export const ONCE_COMPONENT_STORE = new Map<string,ComponentItem>();
export function storeControlComponent(item: ComponentItem) {

    COMPONENT_STORE.set(item.id,item);
    ONCE_COMPONENT_STORE.set(item.id,item);
}

export const controllersMapping = {
    "PlayButton": PlayButton,
    "Playrate": Playrate,
    "Volume": Volume,
    "FullScreen": FullScreen
}