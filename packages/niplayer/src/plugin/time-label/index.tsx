import { UIPlugin } from "@/base/ui.plugin";
import { JSX } from "solid-js/jsx-runtime";
import "./index.less";

export class TimeLabel extends UIPlugin {
    protected name: string = 'time-label';

    protected render(): JSX.Element | string | HTMLElement {
        const { state } = this.player.rootStore.mediaStore;
        return (
            <div class="niplayer-controller-time-label-container">
                <span class="current-time">{state.currentTime}</span>
                <span class="split">/</span>
                <span class="total-time">{state.totalTime}</span>
            </div>
        )
    }

    protected afterRender(): void {
        this.player.nodes.controllerBarMiddleLeft.append(this.element);
    }
}