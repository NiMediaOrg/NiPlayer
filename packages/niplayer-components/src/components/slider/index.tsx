import type {} from "solid-styled-jsx";

interface SliderProps {
    progress: number;
    /** 视频缓冲的buffer长度 */
    bufferProgress?: number;
    previewProgress?: number;
    width?: number;
    height?: number
    minProgress?: number;
    maxProgress?: number;
    hidden?: boolean;
    dotScale?: number;
    dotHidden?: boolean;
    onChange?: (progress: number) => void;
    onMouseDown?: () => void;
    onMouseMove?: (per: number) => void;
    onMouseUp?: (per: number) => void;
    hover?: (per: number) => void;
}

const Slider = (props: SliderProps) => {
    let sliderHTML: HTMLDivElement = null;

    const getProgressPercentage = (per: number) => {
        return Math.max(props.minProgress || 0.005, Math.min(props.maxProgress || 0.9, per));
    }

    const handleMouseDown = (e: MouseEvent) => {
        const x = e.offsetX;
        props.onChange?.(getProgressPercentage(x / sliderHTML.clientWidth));
        props.onMouseDown?.();
        const initPer = props.progress;
        document.onmousemove = (ev: MouseEvent) => {
            const deltaX = ev.clientX - e.clientX;
            const per = getProgressPercentage(initPer + deltaX / sliderHTML.clientWidth);
            props.onChange?.(per);
            props.onMouseMove?.(per);
        }

        document.onmouseup = (evs: MouseEvent) => {
            document.onmousemove = null;
            document.onmouseup = null;
            const deltaX = evs.clientX - e.clientX;
            const per = getProgressPercentage(initPer + deltaX / sliderHTML.clientWidth);
            props.onMouseUp?.(per);
        }
    }

    const handleMouseMove = (e) => {
        props.hover?.(getProgressPercentage(e.offsetX / sliderHTML.clientWidth))
    }
        
    return (
        <>
            <div class="nova-slider-container" ref={sliderHTML} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove}>
                <div class="nova-slider-top"></div>
                <div class="nova-slider-middle">
                    <div class="nova-slider-buffer"></div>
                    <div class="nova-slider-preview"></div>
                    <div class="nova-slider-done"></div>
                    <div class="nova-slider-dot"></div>
                </div>
                <div class="nova-slider-bottom"></div>
            </div>
            <style jsx dynamic>
                {
                    `.nova-slider-container {
                            width: ${props.width !== undefined ? `${props.width}px` : '100%'};
                            height: ${props.height !== undefined ? `${props.height}px` : '100%'};
                            background-color: #ffffff40;
                            border-radius: 5px;
                            position: relative;
                            margin-right: 10px;
                            display: ${props?.hidden ? 'none' : ''};
                            transition: width .3s ease, height .1s ease;
                            transform-origin: center center;
                        }

                        .nova-slider-top {
                            position: absolute;
                            width: 100%;
                            height: 10px;
                            top: -10px;
                            left: 0%;
                            background-color: transparent;
                        }

                        .nova-slider-bottom {
                            position: absolute;
                            width: 100%;
                            height: 10px;
                            top: 3px;
                            background-color: transparent;
                        }

                        .nova-slider-middle {
                            width: 100%;
                            height: 100%;
                        }

                        .nova-slider-done {
                            background-color: #f00;
                            width: 100%;
                            transform: scaleX(${props.progress !== undefined ? props.progress + '' : '0'});
                            transform-origin: left bottom;
                            transition: width .3s ease, height .1s ease;
                            border-radius: 5px;
                            pointer-events: none;
                            box-sizing: border-box;
                            position: absolute;
                            height: 110%;
                        }

                        .nova-slider-buffer {
                            background-color: #ffffff4e;
                            width: 100%;
                            transform: scaleX(${props.bufferProgress !== undefined ? props.bufferProgress + '' : '0'});
                            transform-origin: left bottom;
                            transition: width .3s ease, height .1s ease;
                            border-radius: 5px;
                            pointer-events: none;
                            box-sizing: border-box;
                            position: absolute;
                            bottom: 0px;
                            top: 0px;
                        }

                        .nova-slider-preview {
                            background-color: #fffffff2;
                            width: 100%;
                            transform: scaleX(${props.previewProgress !== undefined ? props.previewProgress + '' : '0'});
                            transform-origin: left bottom;
                            transition: width .3s ease, height .1s ease;
                            border-radius: 5px;
                            pointer-events: none;
                            box-sizing: border-box;
                            position: absolute;
                            bottom: 0px;
                            top: 0px;
                        }

                        .nova-slider-dot {
                            background-color: #f00;
                            width: 12px;
                            height: 12px;
                            border-radius: 6px;
                            position: absolute;
                            top: 50%;
                            left: ${props.progress !== undefined ? props.progress * 100 + '': '100'}%;
                            pointer-events: none;
                            transform: translate(-50%, -50%) scale(${props.dotScale !== undefined ? props.dotScale : 1});
                            transform-origin: center center;
                            transition: transform .3s ease;
                            display: ${props?.dotHidden? 'none' : ''};
                        }`
                }
            </style>
        </>
    )
}

export default Slider;