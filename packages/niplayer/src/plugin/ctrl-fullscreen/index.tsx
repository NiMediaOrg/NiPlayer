import { fullscreen, leaveFullscreen } from "@/assets/svg";
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
            <div class="niplayer-controller-middle-item niplayer-controller-fullscreen-container" onClick={() => handleClick()} >
                <div innerHTML={state.isEnterFullscreen ? leaveFullscreen :  fullscreen} style={{width: '100%', height: '100%'}}></div>
                <span class="niplayer-controller-middle-item-tip">{state.isEnterFullscreen ? '退出全屏' : '全屏'}</span>
            </div>
        )
    }

    protected afterRender(): void {
        this.player.nodes.controllerBarMiddleRight.append(this.element);
    }
}