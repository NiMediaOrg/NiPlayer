import { NI_PLAYER_EVENT } from "@/events";
import NiPlayer from "@/player";
import { createStore, SetStoreFunction } from "solid-js/store";
/**
 * @instance 基础store抽象类，用于管理各种状态
 */
export default abstract class BaseStore<T extends object = object> {
    /**
     * @getter
     * @desc This MUST be a Getter.
     * @desc 设置默认状态。Store 初始化完成后，可读取 `Store.state` 来获取状态
     */
    abstract get defaultState(): T;
    /**
     * @readonly
     * @desc Only observe shallow(one-level-deep).
     * @desc 基础状态。默认在触发 dispose 事件时，会被重置为 `Store.defaultState`
     */
    state: T;

    setState: SetStoreFunction<T>;

    protected player: NiPlayer;

    private initState() {
        const [state, setState] = createStore(this.defaultState);
        this.state = state;
        this.setState = setState;
    }

    constructor(player: NiPlayer) {
        this.initState();
        this.player = player;
        this.player.on(NI_PLAYER_EVENT.MOUNTED, () => {
            this.mounted();
        })
    }
    /**
     * @desc 在ui视图渲染完成后调用
     */
    mounted() {}
}