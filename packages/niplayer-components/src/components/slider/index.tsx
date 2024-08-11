import { createEffect, onMount } from "solid-js";
import { css } from "../../utils/css";
import type {} from "solid-styled-jsx";

interface SliderProps {
    progress: number;
    width?: number;
    height?: number
    minProgress?: number;
    maxProgress?: number;
    onChange?: (progress: number) => void;
}

const Slider = (props: SliderProps) => {
    let sliderHTML: HTMLDivElement = null;

    // onMount(() => {
    //     createEffect(() => {
    //         sliderHTML.style.width = props.width + '';
    //     })
    // })

    const getProgressPercentage = (per: number) => {
        return Math.max(props.minProgress || 0.005, Math.min(props.maxProgress || 0.9, per));
    }

    const handleMouseDown = (e: MouseEvent) => {
        const x = e.offsetX;
        props.onChange(getProgressPercentage(x / sliderHTML.clientWidth));
        const initPer = props.progress;
        document.onmousemove = (ev: MouseEvent) => {
            const deltaX = ev.clientX - e.clientX;
            const per = getProgressPercentage(initPer + deltaX / sliderHTML.clientWidth);
            props.onChange(per);
        }

        document.onmouseup = () => {
            document.onmousemove = null;
            document.onmouseup = null;
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
            <style>
                {
                    css`
                        .nova-slider-container {
                            width: ${props.width ? `${props.width}px` : '100%'};
                            height: ${props.height ? `${props.height}px` : '100%'};
                            background-color: #faf4f4fc;
                            border-radius: 5px;
                            position: relative;
                            margin-right: 10px;
                            display: ${props.width ? '' : 'none'}
                            /* transition: width .5s ease; */
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
                            transform: scaleX(${props.progress ? props.progress + '' : '1'});
                            transform-origin: left;
                            border-radius: 5px;
                            pointer-events: none;
                        }

                        .nova-slider-dot {
                            background-color: #f00;
                            width: 12px;
                            height: 12px;
                            border-radius: 6px;
                            position: absolute;
                            top: 50%;
                            margin-top: -6px;
                            margin-right: -6px;
                            left: ${props.progress ? props.progress * 100 + '': '100'}%;
                            pointer-events: none;
                            
                        }
                    `
                }
            </style>
        </>

    )
}

export default Slider;