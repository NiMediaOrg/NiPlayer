import { UIPlugin } from "@/base/ui.plugin";
import { JSX } from "solid-js/jsx-runtime";
import { pipInPip } from "@/assets/svg";

export class PipInPip extends UIPlugin {
    protected name: string = 'pip-in-pip';

    protected render(): JSX.Element | string | HTMLElement {
        console.log(pipInPip)
        const { state, setState } = this.player.rootStore.mediaStore;
        const handleClick = () => {
            if (state.isEnterPipInPip) {
                this.player.exitPipInPip();
            } else {
                this.player.requestPipInPip();
            }
        }
        return (
            <div class="niplayer-controller-middle-item niplayer-controller-pipInPip-container" onClick={() => handleClick()} >
                <div innerHTML={pipInPip} style={{width: '100%', height: '100%'}}></div>
                <span class="niplayer-controller-middle-item-tip">{state.isEnterPipInPip ? '退出画中画' : '画中画'}</span>
            </div>
        )
    }

    protected afterRender(): void {
        this.player.nodes.controllerBarMiddleRight.append(this.element);
    }
}