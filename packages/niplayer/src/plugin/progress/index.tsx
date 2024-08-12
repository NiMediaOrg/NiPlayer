import { UIPlugin } from "@/base/ui.plugin";
import { Slider } from "niplayer-components";
import { createSignal, JSX } from "solid-js";
import "./index.less";

export class Progress extends UIPlugin {
    protected name: string = 'progress-bar';

    protected render(): JSX.Element | string | HTMLElement {
        const [progress, setProgress] = createSignal(0.5)
        const handleChange = (val) => {
            setProgress(val);
        }
        return (
            <div class="niplayer-progress-container" style={{cursor: 'pointer'}}>
                <Slider progress={progress()} height={3} onChange={handleChange}/>
            </div>
        )
    }

    protected afterRender(): void {
        this.player.nodes.controllerBarTop.append(this.element);
    }
}