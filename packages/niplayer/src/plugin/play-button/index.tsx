import { UIPlugin } from "@/base/ui.plugin";
import { JSX } from "solid-js/jsx-runtime";

export class PlayButton extends UIPlugin {
    protected name: string = 'play-button';

    protected render(): JSX.Element | string | HTMLElement {
        const { state, setState } = this.player.rootStore.mediaStore;
        const handleClick = () => {
            if (state.paused) {
                this.player.play();
            } else {
                this.player.pause();
            }
        }
        
        return (
            <div class="niplayer-controller-middle-item niplayer-controller-playbtn-container" onclick={() => handleClick()}>
                {
                    state.paused ? '播放' : '暂停'
                }
            </div>
        )
    }

    protected afterRender(): void {
        this.player.nodes.controllerBarMiddleLeft.append(this.element);
    }
}