import { UIPlugin } from "@/base/ui.plugin";
import { JSX } from "solid-js/jsx-runtime";

export class FullScreen extends UIPlugin {
    protected name: string = 'fullscreen';

    protected render(): JSX.Element | string | HTMLElement {
        const { state, setState } = this.player.rootStore.mediaStore;

        const handleClick = () => {
            if (state.isEnterFullscreen) {
                this.player.exitFullScreen();
            } else {
                this.player.requestFullScreen();
            }
        }

        return (
            <div class="niplayer-controller-middle-item niplayer-controller-fullscreen-container" onClick={() => handleClick()}>
                {state.isEnterFullscreen ? '退出全屏' : '进入全屏' }
            </div>
        )
    }

    protected afterRender(): void {
        this.player.nodes.controllerBarMiddleRight.append(this.element);
    }
}