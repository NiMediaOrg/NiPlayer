import { UIPlugin } from "@/base/ui.plugin";
import { JSX } from "solid-js";
import * as svg from "@/assets/svg"
export class VideoRecorder extends UIPlugin {
    protected name: string = 'video-recorder';
    protected mediaRecorder: MediaRecorder;

    /**
     * @desc 开始录制视频
     */
    protected startRecord() {
        // this.mediaRecorder = new MediaRecorder(this.player.nodes.videoElement.captureStream)
        this.player.rootStore.toastStore.create({
            text: '开始录制视频',
            duration: 2000,
            position: 'bottom-left'
        })
    }

    protected render(): JSX.Element | string | HTMLElement {
        return (
            <div class="niplayer-controller-middle-item niplayer-imageshot-container">
                <div innerHTML={svg.videoRecorder} style={{width: '60%', height: '60%'}} onclick={() => this.startRecord()}></div>
                <span class="niplayer-controller-middle-item-tip">录制视频</span>
            </div>
        )
    }

    protected afterRender(): void {
        this.player.nodes.controllerBarMiddleRight.append(this.element);
    }

    protected dispose(): void {
        console.log('dispose')
    }
}