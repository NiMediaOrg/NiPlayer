import { UIPlugin } from "@/base/ui.plugin";
import { Slider } from "niplayer-components";
import { createSignal, JSX } from "solid-js";
import "./index.less";
import Utils from "@/shared/utils";

export class Progress extends UIPlugin {
    protected name: string = 'progress-bar';

    protected initSliderHeight: number = 3;
    protected hoverSliderHeight: number = 6;
    protected progressSignal = createSignal(0);
    protected canvas: HTMLCanvasElement = document.createElement('canvas');
    protected shotImage: HTMLImageElement = document.createElement('img');

    protected thumbContainer: HTMLDivElement;
    protected imageUrlStore = {};

    protected get progressPercentage(): number {
        if (this.player.rootStore.actionStore.state.isProgressDrag) {
            return this.progressSignal[0]();
        }
        const { state } = this.player.rootStore.mediaStore;
        const val = isNaN(state.currentTime / state.totalTime) ? 0 : state.currentTime / state.totalTime;
        return val;
    }

    protected get bufferProgressPercentage(): number {
        const { state, bufferTime } = this.player.rootStore.mediaStore;
    
        const val = isNaN(bufferTime / state.totalTime)? 0 : bufferTime / state.totalTime;
        return val;
    } 

    protected get previewProgressPercentage(): number {
        const previewTime = this.player.rootStore.actionStore.state.previewTime;
        return this.player.rootStore.actionStore.state.isHoverProgress? previewTime : 0;
    }

    protected get thumbPosition(): {
        x: number,
        y: number
    } {
        const num = this.player.config.thumbnail?.num;
        const gap = this.player.rootStore.mediaStore.state.totalTime / num;
        const currentTime = this.player.rootStore.actionStore.state.hoverTime;
        const currentIndex = Math.floor(currentTime / gap);
        const y = Math.floor(currentIndex / this.player.config.thumbnail.columns) * this.player.config.thumbnail?.height;
        const x = (currentIndex % this.player.config.thumbnail.columns) * this.player.config.thumbnail?.width;
        return {
            x: x, y: y
        }
    }

    get thumbLeft() {
        const hoverPer = this.player.rootStore.actionStore.state.hoverTime / this.player.rootStore.mediaStore.state.totalTime * 100 - this.thumbContainer.clientWidth / 2 / this.player.nodes.controllerBarMiddle.clientWidth * 100;

        const minPer = 2;
        const maxPer = 98 - this.thumbContainer.clientWidth / this.player.nodes.controllerBarMiddle.clientWidth * 100
        return Math.max(minPer, Math.min(maxPer, hoverPer)) ?? 0;
    }

    protected get timeLabel(): string {
        const { state } = this.player.rootStore.mediaStore;
        const currentTime = this.player.rootStore.actionStore.state.previewTime * state.totalTime;
        return Utils.formatTime(currentTime);
    }

    protected get imageUrl() {
        const {x, y} = this.thumbPosition;
        const { width, height } = this.player.config.thumbnail;

        if (this.imageUrlStore[x]?.[y]) {
            return this.imageUrlStore[x][y];
        }
        const ctx = this.canvas.getContext('2d');
        ctx.drawImage(this.shotImage, x, y, width, height, 0, 0, width, height);
        const url = this.canvas.toDataURL();
        if (!this.imageUrlStore[x]) {
            this.imageUrlStore[x] = {};
        }
        this.imageUrlStore[x][y] = url;
        return url;
    }


    protected render(): JSX.Element | string | HTMLElement {
        this.shotImage.src = this.player.config.thumbnail?.url ?? '';
        this.canvas.width = this.player.config.thumbnail?.width?? 160;
        this.canvas.height = this.player.config.thumbnail?.height?? 90;
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

        const onHover = (per: number) => {
            const { state } = this.player.rootStore.mediaStore;
            const time = Math.max(state.currentTime, per * state.totalTime);
            const val = isNaN(time / state.totalTime)? 0 : time / state.totalTime;
            this.player.rootStore.actionStore.setState('previewTime', val);
            this.player.rootStore.actionStore.setState('hoverTime', per * state.totalTime);
        }

        return (
            <div class="niplayer-progress-container" style={{cursor: 'pointer', position: 'absolute', bottom: '0', width: '100%'}} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                <div class="niplayer-progress-thumbnail-container" style={{
                    left: `${this.thumbLeft}%`,
                    display: this.player.rootStore.actionStore.state.isHoverProgress ? '' : 'none'
                }} ref={this.thumbContainer}>
                    <div class="niplayer-progress-thumbnail" style={{
                        display: this.player.config.thumbnail ? '' : 'none',
                    }}>
                        <img src={this.imageUrl} alt="预览图" />
                    </div>
                    <div class="niplayer-progress-time-label">{this.timeLabel}</div>
                </div>
                <Slider 
                    progress={this.progressPercentage} 
                    bufferProgress={this.bufferProgressPercentage}
                    previewProgress={this.previewProgressPercentage}
                    height={sliderHeight()} 
                    onChange={handleChange} 
                    dotScale={dotScale()} 
                    onMouseDown={handleMouseDown} 
                    onMouseUp={handleMouseUp}
                    maxProgress={1}
                    minProgress={0}
                    hover={onHover}
                />
            </div>
        )
    }

    protected afterRender(): void {
        this.player.nodes.controllerBarTop.append(this.element);
    }
}