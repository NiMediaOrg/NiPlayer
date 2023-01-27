import { FullScreen } from "../component/Controller/parts/FullScreen";
import { PlayButton } from "../component/Controller/parts/PlayButton";
import { Playrate } from "../component/Controller/parts/Playrate";
import { Volume } from "../component/Controller/parts/Volume";
import { ComponentItem } from "../types/Player";
export declare const CONTROL_COMPONENT_STORE: Map<string, ComponentItem>;
export declare function storeControlComponent(item: ComponentItem): void;
export declare const controllersMapping: {
    PlayButton: typeof PlayButton;
    Playrate: typeof Playrate;
    Volume: typeof Volume;
    FullScreen: typeof FullScreen;
};
