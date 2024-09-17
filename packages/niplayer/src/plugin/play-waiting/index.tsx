import { UIPlugin } from "@/base/ui.plugin";
import { JSX } from "solid-js";
import { Loading } from "niplayer-components";
import "./index.less";

export class PlayWaiting extends UIPlugin {
    protected name: string = 'play-waiting';

    protected render(): JSX.Element | string | HTMLElement {
        const { state } = this.player.rootStore.mediaStore;
        return (
            <div class="niplayer-play-waiting-container" style={{'display': state.waiting ? '' : 'none'}}>
                <div class="niplayer-play-waiting-icon-box">
                    <Loading width={32} height={32} loadingMessage="加载中..." onUpdate={() => console.log('loading')}/>
                </div>
            </div>
        )
    }

    protected afterRender(): void {
        this.player.nodes.container.append(this.element);
    }
}