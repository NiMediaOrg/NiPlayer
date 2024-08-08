import NiPlayer from "@/player";
import { observable, runInAction } from "mobx";
/**
 * @instance 基础store抽象类，用于管理各种状态
 */
export default abstract class BaseStore<T = void> {
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

    protected player: NiPlayer;

    private initState() {
        this.state = observable.object(this.defaultState, null, {
            deep: false
        })
    }

    constructor(player: NiPlayer) {
        this.initState();
        this.player = player;
    }

    protected setState(newVal: Partial<T>): void {
        runInAction(() => {
            for (let key in newVal) {
                if (this.defaultState[key] && this.defaultState[key] !== newVal[key]) {
                    this.state[key] = newVal[key];
                }
            }
        })
    }
}