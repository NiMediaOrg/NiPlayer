import BasePlugin from "@/base/base.plugin";
import { IToastConfig } from "@/store/toast.store";
import { watchMap } from "@/utils/watch-map";
import "./index.less";

export class Toast extends BasePlugin {
    protected name: string = 'toast';

    protected install(): void {
        watchMap(() => this.player.rootStore.toastStore.state.toastMap, {
            add: (task) => {
                console.log('add', task)
                this.appendToast(task);
            },
        })
    }

    protected appendToast(task: IToastConfig) {
        const layer = this.player.nodes.toastLayer;
        const toast = document.createElement('div');
        toast.classList.add('niplayer-toast-container');
        toast.style.position = 'absolute';
        toast.style.bottom = '80px';
        toast.style.left = '20px'; 
        toast.textContent = task.text;
        layer.append(toast);
        window.requestAnimationFrame(() => {
            toast.classList.add('show');
        })
    }

    

    protected dispose(): void {
        console.log('[Plugin Dispose] The Toast has been disposed')
    }
}