import { UIPlugin } from "@/base/ui.plugin";
import { Slider } from "niplayer-components";
import { createSignal, JSX } from "solid-js";
import "./index.less";

export class Progress extends UIPlugin {
    protected name: string = 'progress-bar';

    protected initSliderHeight: number = 3;
    protected hoverSliderHeight: number = 5;
    protected progressSignal = createSignal(0);

    protected get progressPercentage(): number {
        if (this.player.rootStore.actionStore.state.isProgressDrag) {
            return this.progressSignal[0]();
        }
        const { state } = this.player.rootStore.mediaStore;
        const val = isNaN(state.currentTime / state.totalTime) ? 0 : state.currentTime / state.totalTime;
        return val;
    } 

    protected render(): JSX.Element | string | HTMLElement {
        const [ sliderHeight, setSliderHeight ] = createSignal(this.initSliderHeight);
        const [ dotScale, setDotScale ] = createSignal(0);
        const handleChange = (val: number) => {
            this.progressSignal[1](val);
        }

        const handleMouseEnter = () => {
            this.player.rootStore.actionStore.setState('isHoverProgress', true);
            setSliderHeight(this.hoverSliderHeight);
            setDotScale(1);
        }

        const handleMouseLeave = () => {
            this.player.rootStore.actionStore.setState('isHoverProgress', false);
            setSliderHeight(this.initSliderHeight);
            setDotScale(0);
        }

        const handleMouseDown = () => {
            this.player.rootStore.actionStore.setState('isProgressDrag', true);
        }

        const handleMouseUp = (per: number) => {
            this.player.seek(per * this.player.rootStore.mediaStore.state.totalTime).then(() => {
                this.player.rootStore.actionStore.setState('isProgressDrag', false);
            });
        }
        return (
            <div class="niplayer-progress-container" style={{cursor: 'pointer', position: 'absolute', bottom: '0', width: '100%'}} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                <Slider progress={this.progressPercentage} height={sliderHeight()} onChange={handleChange} dotScale={dotScale()} onMouseDown={handleMouseDown} onMouseUp={handleMouseUp}/>
            </div>
        )
    }

    protected afterRender(): void {
        this.player.nodes.controllerBarTop.append(this.element);
    }
}