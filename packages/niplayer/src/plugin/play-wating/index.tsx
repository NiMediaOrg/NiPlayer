import { UIPlugin } from "@/base/ui.plugin";
import { JSX } from "solid-js";
import "./index.less";

export class PlayWaiting extends UIPlugin {
    protected name: string = 'play-waiting';

    protected render(): JSX.Element | string | HTMLElement {
        const { state } = this.player.rootStore.mediaStore;
        return (
            <div class="niplayer-play-waiting-container" style={{'display': state.waiting ? '' : 'none'}}>
                {state.waiting ? '缓冲中' : '播放中'}
            </div>
        )
    }

    protected afterRender(): void {
        this.player.nodes.container.append(this.element);
    }
}