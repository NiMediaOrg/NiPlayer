import { FullScreen } from "../component/Controller/parts/FullScreen";
import { PlayButton } from "../component/Controller/parts/PlayButton";
import { Playrate } from "../component/Controller/parts/Playrate";
import { Volume } from "../component/Controller/parts/Volume";
import { ComponentItem } from "../types/Player";

export const CONTROL_COMPONENT_STORE = new Map<string,ComponentItem>();

export function storeControlComponent(item:ComponentItem) {
    CONTROL_COMPONENT_STORE.set(item.id,item);
}

export const controllersMapping = {
    "PlayButton": PlayButton,
    "Playrate": Playrate,
    "Volume": Volume,
    "FullScreen": FullScreen
}