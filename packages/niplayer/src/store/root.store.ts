import BaseStore from "@/base/base.store";
import NiPlayer from "@/player";
import MediaStore from "./media.store";
import ActionStore from "./action.store";
import { SettingStore } from "./setting.store";
export interface RootState {
    playerInitialized?: boolean;
}
/**
 * @desc 根store，维护所有的子store，作为子store和player之间通信的桥梁
 */
export class RootStore extends BaseStore<RootState> {
    public mediaStore: MediaStore;
    public actionStore: ActionStore;
    public settingStore: SettingStore;
    get defaultState() {
        return {
            playerInitialized: false
        }
    }

    decomposeSubStore() {
        this.mediaStore = new MediaStore(this.player);
        this.actionStore = new ActionStore(this.player);
        this.settingStore = new SettingStore(this.player);
    }

    constructor(player: NiPlayer) {
        super(player);
        this.setState({
            playerInitialized: true
        });
        this.decomposeSubStore();
    }
}