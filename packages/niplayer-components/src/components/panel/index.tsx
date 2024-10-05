import type { JSX } from "solid-js";
import { FONT_SIZE, HEADER_HEIGHT, ICON_HEIGHT, ICON_WIDTH, PADDING_BOTTOM, PADDING_TOP } from "./constants";
import { calculateSize } from "./calculate";

export interface IPanel {
    items?: IPanelItem[],
    title?: string;
    headerIcon?: string;
    panelItemClick?: (item: IPanelItem) => void;
}

export interface IPanelItem {
    content: string | (() => string);
    icon?: string;
    tip?: string | (() => string);
    button?: string;
    jump?: IPanel;
    val?: any;
    id?: string;

}

interface PanelProps {
    main: IPanel;
    side?: IPanel;
    hidden?: boolean;
    onBackClick?: () => void;
}

const Panel = (props: PanelProps) => {
    let mainList: HTMLUListElement = null, sideList: HTMLUListElement = null, container: HTMLDivElement = null;

    const handleBack = () => {
        props.onBackClick?.();
    }

    return (
        <>
            <div class="nova-panel-container" style={{opacity: props.hidden ? 0 : 1}} ref={container}>
                {/* 主列表 */}
                <ul class="nova-panel-list nova-panel-main-list" ref={mainList} style={{
                    height: `${calculateSize(props.main)?.height ?? 0}px`
                }}>
                    {
                        props.main.items && props.main.items.map((item, index) => {
                            return (
                                <li class="nova-panel-list-item" onClick={() => props.main.panelItemClick?.(item)}>
                                    <div class="nova-panel-list-item-left">
                                        <span class="nova-panel-list-item-icon" innerHTML={item.icon || ''}></span>
                                        <span class="nova-panel-list-item-content">{typeof item.content === 'function' ? item.content() : item.content}</span>
                                    </div>
                                    <div class="nova-panel-list-item-right">
                                        <span class="nova-panel-list-item-tip">{typeof item.tip === 'function' ? item.tip() : item.tip}</span>
                                        <span class="nova-panel-list-item-button" innerHTML={item.button || ''}></span>
                                    </div>
                                </li>
                            )
                        })
                    }
                </ul>
                {/* 副列表 */}
                <ul class="nova-panel-list nova-panel-side-list" ref={sideList} style={{
                    height: `${calculateSize(props.side)?.height ?? 0}px`
                }}>
                    {
                        props.side?.items ? 
                        <>
                            <div class="nova-panel-header" onclick={handleBack}>
                                <span class="nova-panel-header-back" innerHTML={props.side.headerIcon}></span>
                                <span class="nova-panel-header-title">{props.side.title}</span>
                            </div>
                            {
                                props.side.items.map((item, index) => {
                                    return (
                                        <li class="nova-panel-list-item" onClick={() => props.side?.panelItemClick?.(item)}>
                                            <div class="nova-panel-list-item-left">
                                                <span class="nova-panel-list-item-icon" innerHTML={item.icon || ''}></span>
                                                <span class="nova-panel-list-item-content">{typeof item.content === 'function' ? item.content() : item.content}</span>
                                            </div>
                                            <div class="nova-panel-list-item-right">
                                                <span class="nova-panel-list-item-tip">{typeof item.tip === 'function' ? item.tip() : item.tip}</span>
                                                <span class="nova-panel-list-item-button" innerHTML={item.button || ''}></span>
                                            </div>
                                        </li>
                                    )
                                })
                            }
                    </> : ''
                    }
                    
                </ul>
            </div>

            <style jsx dynamic>
            {
                `
                    .nova-panel-container {
                        background-color: #2d2a2ae7;
                        border-radius: 10px;
                        font-size: ${FONT_SIZE}px;
                        overflow: hidden;
                        position: relative;
                        transition: opacity 0.5s ease;
                    }

                    .nova-panel-list {
                        list-style: none;
                        padding: 0;
                        margin: 0;
                        transition: height .5s ease, transform .2s ease;
                    }

                    .nova-panel-main-list {
                        position: ${props.side?.items ? 'absolute' : 'relative'};
                        transform: ${props.side?.items ? 'translateX(-100%)' : 'translateX(0)'};
                        left: 0;
                        bottom: 0;
                    }

                    .nova-panel-side-list {
                        position: ${props.side?.items ? 'relative' : 'absolute'};
                        transform: ${props.side?.items ? 'translateX(-100%)' : 'translateX(0)'};
                        left: 100%;
                        bottom: 0;
                    }

                    .nova-panel-header {
                        width: 100%;
                        height: ${HEADER_HEIGHT}px;
                        padding-left: 15px;
                        display: flex;
                        align-items: center;
                        border-radius-top-left: 10px;
                        border-radius-top-right: 10px;
                        box-sizing: border-box;
                        border-bottom: 1px solid #9d9d9d;
                    }

                    .nova-panel-header-back {
                        width: 18px;
                        height: 18px;
                    }

                    .nova-panel-header-back svg {
                        width: 100%;
                        height: 100%;
                    }

                    .nova-panel-header-title {
                        margin-left: 10px;
                    }

                    .nova-panel-list-item {
                        white-space: nowrap;
                        width: 230px;
                        padding: ${PADDING_TOP}px 15px ${PADDING_BOTTOM}px 15px;
                        display: flex;
                        align-items: center;
                        border-radius: 10px;
                        justify-content: space-between;
                    }

                    .nova-panel-list-item-left, .nova-panel-list-item-right {
                        display: flex;
                        align-items: center;
                    }

                    .nova-panel-list-item:hover {
                        background-color: #4a4848;
                    }

                    .nova-panel-list-item-icon {
                        width: ${ICON_WIDTH}px;
                        height: ${ICON_HEIGHT}px;
                        display: inline-block;
                        margin-right: 10px;
                    }
                    .nova-panel-list-item-icon svg {
                        width: 100%;
                        height: 100%;
                    }

                    .nova-panel-list-item-tip {
                        font-size: 12px;
                        margin-right: 10px;
                        color: #ddd;
                    }

                    .nova-panel-list-item-button {
                        width: 14px;
                        height: 14px;
                        line-height: 1;
                    }

                    .nova-panel-list-item-button svg {
                        width: 100%;
                        height: 100%;
                    }
                `
            }

            </style>
        </>
    )
}

export default Panel;