import BaseStore from "@/base/base.store";
import Utils from "@/shared/utils";
import bind from "bind-decorator";
interface ActionState {
    isProgressDrag: boolean;
    isHoverProgress: boolean;
    isControllerBarHidden: boolean;
    isTopBarHidden: boolean;
    isVolumeDrag: boolean;
    previewTime: number;
}

export default class ActionStore extends BaseStore<ActionState> {
    private hiddenTimer: number = null;
    private hiddenGap: number = 3;
    get defaultState(): ActionState {
        return {
            isProgressDrag: false,
            isHoverProgress: false,
            isControllerBarHidden: true,
            isTopBarHidden: true,
            isVolumeDrag: false,
            previewTime: 0,
        }
    }

    mounted(): void {
        this.player.nodes.container.addEventListener('mouseenter', this.onMouseEnter);
        this.player.nodes.container.addEventListener('mouseleave', this.onMouseLeave);

        this.player.useState(() => this.state.isHoverProgress, (hover) => {
            if (hover) {
                this.player.nodes.controllerBarMiddle.style.pointerEvents = 'none';
            } else {
                this.player.nodes.controllerBarMiddle.style.pointerEvents = 'auto';
            }
        })
    }

    @bind
    private onMouseEnter(e: MouseEvent) {
        this.player.nodes.container.addEventListener('mousemove', this.onMouseMove);
        this.setState({
            isControllerBarHidden: false,
            isTopBarHidden: false,
        });        
        window.clearTimeout(this.hiddenTimer);
        if (Utils.checkPathContainDom(e.composedPath() as HTMLElement[], this.player.nodes.controllerBar) || Utils.checkPathContainDom(e.composedPath() as HTMLElement[], this.player.nodes.topArea)) return;
        this.hiddenTimer = window.setTimeout(() => {    
            this.setState({
                isControllerBarHidden: true,
                isTopBarHidden: true,
            });
        }, this.hiddenGap * 1000)
    }

    @bind
    private onMouseLeave() {
        this.player.nodes.container.removeEventListener('mousemove', this.onMouseMove);
        this.setState({
            isControllerBarHidden: true,
            isTopBarHidden: true,
        }); 
    }

    @bind
    private onMouseMove(e: MouseEvent) {
        this.setState({
            isControllerBarHidden: false,
            isTopBarHidden: false,
        });  
        window.clearTimeout(this.hiddenTimer);
        if (Utils.checkPathContainDom(e.composedPath() as HTMLElement[], this.player.nodes.controllerBar) || Utils.checkPathContainDom(e.composedPath() as HTMLElement[], this.player.nodes.topArea)) return;
        this.hiddenTimer = window.setTimeout(() => {
            this.setState({
                isControllerBarHidden: true,
                isTopBarHidden: true,
            });
        }, this.hiddenGap * 1000)
    }
}