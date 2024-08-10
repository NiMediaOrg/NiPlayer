import { UIPlugin } from "@/base/ui.plugin";
import { JSX } from "solid-js/jsx-runtime";

export class PipInPip extends UIPlugin {
    protected name: string = 'pip-in-pip';

    protected render(): JSX.Element | string | HTMLElement {
        const { state, setState } = this.player.rootStore.mediaStore;
        const handleClick = () => {
            if (state.isEnterPipInPip) {
                this.player.exitPipInPip();
            } else {
                this.player.requestPipInPip();
            }
        }
        return (
            <div class="niplayer-controller-middle-item niplayer-controller-pipInPip-container" onClick={() => handleClick()}>
                {
                    state.isEnterPipInPip ? '退出画中画' : '进入画中画'
                }
            </div>
        )
    }

    protected afterRender(): void {
        this.player.nodes.controllerBarMiddleRight.append(this.element);
    }
}