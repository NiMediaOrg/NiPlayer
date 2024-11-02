import { UIPlugin } from "@/base/ui.plugin";
import * as svg from "@/assets/svg"
import "./index.less"
import { JSX } from "solid-js";

export class PauseCenter extends UIPlugin {
    protected name: string = 'pause-center';

    protected install(): void {
        super.install()
        this.player.useState(() => this.player.rootStore.mediaStore.state.paused, (paused) => {
            if (paused) {
                this.element.classList.remove('play')
            } else {
                this.element.classList.add('play')
            }
        }, {
            fireImmediately: true
        })
    }

    protected render(): JSX.Element | string | HTMLElement {
        return (
            <div class="niplayer-pause-center-container">
                <div class="niplayer-pause-center-icon" innerHTML={svg.pauseCenter}></div>
            </div>
        )
    }

    protected afterRender(): void {
        this.player.nodes.videoLayer.appendChild(this.element)
    }
}