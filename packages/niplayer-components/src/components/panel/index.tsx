import { createEffect, onMount } from "solid-js";

export interface IPanelItem {
    content: string;
    icon?: string;
    tip?: string;
    button?: string;
    jump?: IPanelItem[];
}

interface PanelProps {
    items: IPanelItem[];
    sideItems?: IPanelItem[];
    hidden?: boolean;
    onItemClick?: (list: IPanelItem[]) => void;
}

const Panel = (props: PanelProps) => {
    let mainList: HTMLUListElement = null, sideList: HTMLUListElement = null, container: HTMLDivElement = null;
    const handleJump = (index: number) => {
        props.items[index]?.jump && props.onItemClick?.(props.items[index]?.jump);
    }

    createEffect(() => {
        // if (!mainList || !sideList || !container) return;
        // const sideItems = props.sideItems;
        // if (sideItems.length > 0) {
        //     mainList.style.transform = 'translateX(-100%)';
        //     mainList.style.position = 'absolute';

        //     sideList.style.transform = 'translateX(-100%)';
        //     sideList.style.position = 'relative';

        // } else {
        //     // container.style.maxHeight = '150px';
        // }
    })

    return (
        <>
            <div class="nova-panel-container" style={{opacity: props.hidden ? 0 : 1}} ref={container}>
                <ul class="nova-panel-list nova-panel-main-list" ref={mainList}>
                    {
                        props.items.map((item, index) => {
                            return (
                                <li class="nova-panel-list-item" onClick={() => handleJump(index)}>
                                    <div class="nova-panel-list-item-left">
                                        <span class="nova-panel-list-item-icon" innerHTML={item.icon || ''}></span>
                                        <span class="nova-panel-list-item-content">{item.content}</span>
                                    </div>
                                    <div class="nova-panel-list-item-right">
                                        <span class="nova-panel-list-item-tip">{item.tip}</span>
                                        <span class="nova-panel-list-item-button" innerHTML={item.button || ''}></span>
                                    </div>
                                </li>
                            )
                        })
                    }
                </ul>
                <ul class="nova-panel-list nova-panel-side-list" ref={sideList}>
                    {
                        props.sideItems.map((item, index) => {
                            return (
                                <li class="nova-panel-list-item">
                                    <div class="nova-panel-list-item-left">
                                        <span class="nova-panel-list-item-icon" innerHTML={item.icon || ''}></span>
                                        <span class="nova-panel-list-item-content">{item.content}</span>
                                    </div>
                                    <div class="nova-panel-list-item-right">
                                        <span class="nova-panel-list-item-tip">{item.tip}</span>
                                        <span class="nova-panel-list-item-button" innerHTML={item.button || ''}></span>
                                    </div>
                                </li>
                            )
                        })
                    }
                </ul>
            </div>

            <style jsx dynamic>
            {
                `
                    .nova-panel-container {
                        background-color: rgba(0,0,0,0.8);
                        border-radius: 10px;
                        font-size: 14px;
                        transition: opacity .5s ease, max-height 2.5s ease;
                        overflow: hidden;
                        position: relative;
                        display: grid;
                        max-height: ${props.sideItems.length > 0 ? '1000px' : '200px'}
                    }

                    .nova-panel-list {
                        list-style: none;
                        padding: 0;
                        margin: 0;
                        transition: transform .5s ease;
                    }


                    .nova-panel-main-list {
                        position: ${props.sideItems.length > 0 ? 'absolute' : 'relative'};
                        transform: ${props.sideItems.length > 0 ? 'translateX(-100%)' : 'translateX(0)'};
                        left: 0;
                        bottom: 0;
                    }

                    .nova-panel-side-list {
                        position: ${props.sideItems.length > 0 ? 'relative' : 'absolute'};
                        transform: ${props.sideItems.length > 0 ? 'translateX(-100%)' : 'translateX(0)'};
                        left: 100%;
                        bottom: 0;
                    }

                    .nova-panel-list-item {
                        white-space: nowrap;
                        width: 230px;
                        padding: 10px 15px;
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
                        width: 21px;
                        height: 21px;
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