import { css } from "../../utils/css";
import type {} from "solid-styled-jsx";

interface SliderProps {
    progress: number;
}

const Slider = (props: SliderProps) => {
    return (
        <>
            <div class="nova-slider-container">
                <div class="nova-slider-done"></div>
                <div class="nova-slider-buffer"></div>
                <div class="nova-slider-dot"></div>
            </div>
            <style>
                {
                    css`
                        .nova-slider-container {
                            width: 100%;
                            height: 100%;
                            background-color: red;
                        }

                    `
                }
            </style>
        </>

    )
}

export default Slider;