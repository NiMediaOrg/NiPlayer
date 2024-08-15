import { fullscreen, pause, play } from "@/assets/svg";
import { UIPlugin } from "@/base/ui.plugin";
import { JSX } from "solid-js/jsx-runtime";

export class PlayButton extends UIPlugin {
    protected name: string = 'play-button';

    protected render(): JSX.Element | string | HTMLElement {
        const { state, setState } = this.player.rootStore.mediaStore;
        const handleClick = () => {
            console.log(state.paused)
            if (state.paused) {
                this.player.play();
            } else {
                this.player.pause();
            }
        }
        
        return (
            <div class="niplayer-controller-middle-item niplayer-controller-playbtn-container" onclick={() => handleClick()} >
                <div innerHTML={state.paused ? play : pause} style={{width: '100%', height: '100%'}}></div>
                <span class="niplayer-controller-middle-item-tip">{state.paused ? '播放' : '暂停'}</span>
            </div>
        )
    }

    protected afterRender(): void {
        this.player.nodes.controllerBarMiddleLeft.append(this.element);
    }
}