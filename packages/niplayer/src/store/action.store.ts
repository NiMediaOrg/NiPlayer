import BaseStore from "@/base/base.store";
import { checkPathContainDom } from "@/utils";
import bind from "bind-decorator";
interface ActionState {
    isProgressDrag: boolean;
    isControllerBarHidden: boolean;
    isTopBarHidden: boolean;
}

export default class ActionStore extends BaseStore<ActionState> {
    private hiddenTimer: number = null;
    private hiddenGap: number = 3;
    get defaultState(): ActionState {
        return {
            isProgressDrag: false,
            isControllerBarHidden: true,
            isTopBarHidden: true,
        }
    }

    mounted(): void {
        this.player.nodes.container.addEventListener('mouseenter', this.onMouseEnter);
        this.player.nodes.container.addEventListener('mouseleave', this.onMouseLeave);
    }

    @bind
    private onMouseEnter(e: MouseEvent) {
        this.player.nodes.container.addEventListener('mousemove', this.onMouseMove);
        this.setState({
            isControllerBarHidden: false,
            isTopBarHidden: false,
        });        
        window.clearTimeout(this.hiddenTimer);
        if (checkPathContainDom(e.composedPath() as HTMLElement[], this.player.nodes.controllerBar) || checkPathContainDom(e.composedPath() as HTMLElement[], this.player.nodes.topArea)) return;
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
        if (checkPathContainDom(e.composedPath() as HTMLElement[], this.player.nodes.controllerBar) || checkPathContainDom(e.composedPath() as HTMLElement[], this.player.nodes.topArea)) return;
        this.hiddenTimer = window.setTimeout(() => {
            this.setState({
                isControllerBarHidden: true,
                isTopBarHidden: true,
            });
        }, this.hiddenGap * 1000)
    }
}