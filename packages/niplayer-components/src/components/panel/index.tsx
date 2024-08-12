export interface IPanelItem {
    content: string;
    icon?: string;
    tip?: string;
    button?: string;
    jump?: IPanelItem[];
}

interface PanelProps {
    items: IPanelItem[];
}

const Panel = (props: PanelProps) => {

    return (
        <>
            <div class="nova-panel-container">
                <ul class="nova-panel-list">
                    {
                        props.items.map(item => {
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
                        padding: 5px 10px;
                        border-radius: 10px;
                        font-size: 14px;
                    }

                    .nova-panel-list {
                        list-style: none;
                        padding: 0;
                        margin: 0;
                    }

                    .nova-panel-list-item {
                        white-space: nowrap;
                        width: 230px;
                        padding: 10px 5px;
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