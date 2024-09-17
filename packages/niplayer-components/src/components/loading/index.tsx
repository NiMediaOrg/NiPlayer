interface LoadingProps {
    width: number;
    height: number;
    loadingMessage: string;
    duration?: number;
    onUpdate?: () => void;
}

const Loading = (props: LoadingProps) => {
    return (
        <>
            <div class="nova-loading-container">
                <div class="loading">
                    <div class="one"></div>
                    <div class="two"></div>
                </div>
                <span class="loading-message">{props.loadingMessage}</span>
            </div>
            <style jsx dynamic>
                {
                    `
                        .nova-loading-container {
                            position: relative;
                            display: flex;
                            flex-direction: column;
                            justify-content: center;
                            align-items: center;
                            box-sizing: border-box;
                        }

                        .loading {
                            position: relative;
                            width: ${props.width}px;
                            height: ${props.height}px;
                        }

                        .loading-message {
                            color: #fff;
                            font-size: 14px;
                            line-height: 14px;
                            margin-top: 10px;
                        }

                        .loading > div {
                            position: absolute;
                            top: 50%;
                            left: 50%;
                            border-radius: 100%;
                        }

                        div.one {
                            width: 32px;
                            height: 32px;
                            background: transparent;
                            border-style: solid;
                            border-width: 2px;
                            border-right-color: transparent;
                            border-left-color: transparent;
                            animation: ball-clip-rotate-pulse-rotate 1s cubic-bezier(0.09, 0.57, 0.49, 0.9) infinite;
                        }

                        div.two {
                            width: 16px;
                            height: 16px;
                            background: #fff;
                            animation: ball-clip-rotate-pulse-scale 1s cubic-bezier(0.09, 0.57, 0.49, 0.9) infinite;
                        }

                        @keyframes ball-clip-rotate-pulse-rotate {
                        0% {
                            transform: translate(-50%, -50%) rotate(0deg);
                        }

                        50% {
                            transform: translate(-50%, -50%) rotate(180deg);
                        }

                        100% {
                            transform: translate(-50%, -50%) rotate(360deg);
                        }
                        }

                        @keyframes ball-clip-rotate-pulse-scale {
                        0%,
                        100% {
                            opacity: 1;
                            transform: translate(-50%, -50%) scale(1);
                        }

                        30% {
                            opacity: 0.3;
                            transform: translate(-50%, -50%) scale(0.15);
                        }
                        }
                    `
                }
            </style>
        </>
    )
}

export default Loading;