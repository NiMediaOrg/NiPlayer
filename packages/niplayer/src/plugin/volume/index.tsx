import { UIPlugin } from "@/base/ui.plugin";
import { JSX } from "solid-js/jsx-runtime";
import { volume } from "@/assets/svg";
import { Slider } from "niplayer-components";
import { createSignal } from "solid-js";

import "./index.less";

export class Volume extends UIPlugin {
    protected name: string = 'volume';

    protected minProgress: number = 0.0025;
    protected maxProgress: number = 0.8;

    protected get progress() {
        const { state } = this.player.rootStore.mediaStore;
        const volume = state.volume;
        if (volume === 0) return this.minProgress;
        if (volume === 1) return this.maxProgress;
        return volume;
    }

    protected render(): JSX.Element | string | HTMLElement {
        const { state, setState } = this.player.rootStore.mediaStore;
        const [hideSlider, setHideSlider] = createSignal(true);

        const handleVolumeChange = (val: number) => {
            let volume = val;
            if (val === this.minProgress) {
                volume = 0;
            } else if (val === this.maxProgress) {
                volume = 1;
            }
            setState('volume', volume);
        }

        const handleMouseEnter = () => {
            // console.log('enter', slider);
            setHideSlider(v => !v)
        }

        const handleMouseLeave = () => {
            // console.log('leave');
            setHideSlider(v => !v)
        }

        return (
            <div class="niplayer-controller-middle-item niplayer-controller-volume-container" style={{width: 'auto'}} onmouseenter={handleMouseEnter} onmouseleave={handleMouseLeave}>
                <div innerHTML={volume} style={{width: '48px', height: '48px'}}></div>
                <div class="slider">
                    <Slider 
                        progress={this.progress} 
                        onChange={handleVolumeChange}
                        minProgress={this.minProgress} 
                        maxProgress={this.maxProgress} 
                        width={hideSlider() ? 0 : 60} 
                        height={3}
                        hidden={hideSlider()}
                    />
                </div>
            </div>
        )
    }

    protected afterRender(): void {
        this.player.nodes.controllerBarMiddleLeft.append(this.element);
    }
}