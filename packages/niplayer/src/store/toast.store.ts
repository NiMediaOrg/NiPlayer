import BaseStore from "@/base/base.store";
import { v4 as uuidv4 } from 'uuid';
export interface ToastState {
    toastMap: Map<string, IToastConfig>;
}

export interface IToastConfig {
    position: 'bottom-left' | 'bottom-right' | 'bottom-center' | 'top-left' | 'top-right' | 'top-center' | 'center-left' | 'center-right' | 'center-center',
    duration?: number,
    text: string,
}

export class ToastStore extends BaseStore<ToastState> {
    private generateUniqueId(config: IToastConfig) {
        return `${uuidv4()}-${config.text}-${config.duration}-${config.position}`
    }
    get defaultState(): ToastState {
        return {
            toastMap: new Map()
        }
    }
    /**
     * @desc 创建一个toast
     */
    create(config: IToastConfig) {
        const id = this.generateUniqueId(config);
        if (this.state.toastMap.has(id)) {
            return;
        }

        this.setState('toastMap', (map) => {
            const newMap = new Map(map);
            newMap.set(id, config);
            return newMap;
        })
    }
    /**
     * @desc 移除一个toast
     */
    remove(id: string) {
        this.setState('toastMap', (map) => {
            const newMap = new Map(map);
            newMap.delete(id);
            return newMap;
        })
    }
}