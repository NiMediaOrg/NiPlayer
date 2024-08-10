import { UIPlugin } from "@/base/ui.plugin";
export class MediaPlugin extends UIPlugin {
    protected name: string = 'media-demo';

    protected render() {        
        const { state, setState } = this.player.rootStore.mediaStore;
        return (
            <div class="media-container">
                <span>{state.count}</span>
                <button onclick={() => setState('count', c => c + 1)}>+1</button> 
            </div>
        )
    };

    protected afterRender(): void {
        this.player.nodes.controllerBar.appendChild(this.element)
    }
}