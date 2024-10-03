import type {} from "solid-styled-jsx";

interface SliderProps {
    progress: number;
    width?: number;
    height?: number
    minProgress?: number;
    maxProgress?: number;
    hidden?: boolean;
    dotScale?: number;
    dotHidden?: boolean;
    onChange?: (progress: number) => void;
    onMouseDown?: () => void;
    onMouseMove?: () => void;
    onMouseUp?: (per: number) => void;
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
            props.onMouseMove?.();
        }

        document.onmouseup = (evs: MouseEvent) => {
            document.onmousemove = null;
            document.onmouseup = null;
            const deltaX = evs.clientX - e.clientX;
            const per = getProgressPercentage(initPer + deltaX / sliderHTML.clientWidth);
            props.onMouseUp?.(per);
        }
    }
        
    return (
        <>
            <div class="nova-slider-container" ref={sliderHTML} onMouseDown={handleMouseDown}>
                <div class="nova-slider-top"></div>
                <div class="nova-slider-middle">
                    <div class="nova-slider-done"></div>
                    <div class="nova-slider-buffer"></div>
                    <div class="nova-slider-dot"></div>
                </div>
                <div class="nova-slider-bottom"></div>
            </div>
            <style jsx dynamic>
                {
                    `.nova-slider-container {
                            width: ${props.width !== undefined ? `${props.width}px` : '100%'};
                            height: ${props.height !== undefined ? `${props.height}px` : '100%'};
                            background-color: #faf4f4fc;
                            border-radius: 5px;
                            position: relative;
                            margin-right: 10px;
                            display: ${props?.hidden ? 'none' : ''};
                            transition: width .3s ease;
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
                            top: 5px;
                            background-color: transparent;
                        }

                        .nova-slider-middle {
                            width: 100%;
                            height: 100%;
                        }

                        .nova-slider-done {
                            background-color: #f00;
                            height: 100%;
                            width: 100%;
                            transform: scaleX(${props.progress !== undefined ? props.progress + '' : '1'});
                            transform-origin: left bottom;
                            border-radius: 5px;
                            pointer-events: none;
                            box-sizing: border-box;
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