import { back, setting } from "@/assets/svg";
import { UIPlugin } from "@/base/ui.plugin";
import { createSignal, JSX } from "solid-js";
import { IPanel, IPanelItem, Panel } from "niplayer-components";
import { playrate, ratio, subtitle, rightArrow } from "@/assets/svg";
import "./index.less";

export class Setting extends UIPlugin {
    protected name: string = 'ctrl-setting';

    protected render(): JSX.Element | string | HTMLElement {
        const [settingPanelShow, setSettingPanelShow] = createSignal(false);
        
        const [main, setMain] = createSignal<IPanel>({
            title: 'main',
            panelItemClick: (item: IPanelItem) => setSide(item.jump),
            items: [
                {
                    content: '画面比例',
                    icon: ratio,
                    tip: '正常',
                    button: rightArrow,
                },
                {
                    content: '倍速',
                    icon: playrate,
                    //!! 此处tip的依赖收集没有生效，很是奇怪（已解决， 通过传入函数来延迟tip的取值时机，让其在jsx中渲染时才获取对应的值来正确的收集依赖）
                    tip: () => this.player.rootStore.mediaStore.playRateTitle,
                    button: rightArrow,
                    jump: {
                        title: '倍速',
                        headerIcon: back,
                        panelItemClick: (item: IPanelItem) => {
                            this.player.setPlaybackRate(item.val);
                            handleBack();
                        },
                        items: [
                            {
                                content: '0.25',
                                val: 0.25,
                            },
                            {
                                content: '0.5',
                                val: 0.5,
                            },
                            {
                                content: '0.75',
                                val: 0.75,
                            },
                            {
                                content: '正常',
                                val: 1,
                            },
                            {
                                content: '1.25',
                                val: 1.25,
                            },
                            {
                                content: '1.5',
                                val: 1.5,
                            },
                            {
                                content: '1.75',
                                val: 1.75,
                            },
                            {
                                content: '2',
                                val: 2,
                            }
                        ]
                    }
                },
                {
                    content: '字幕',
                    icon: subtitle,
                    tip: '关闭',
                    button: rightArrow,
                }
            ]
        })

        const [side, setSide] = createSignal<IPanel>({});

        const handleClick = () => {
            setSettingPanelShow(v => !v);
        }

        const handleBack = () => {
            setSide({});
        }

        return (
            <div class="niplayer-controller-middle-item niplayer-setting-controller">
                <div innerHTML={setting} style={{ width: '48px', height: '48px' }} onClick={handleClick}></div>
                <div class="niplayer-setting-panel-container">
                    <Panel main={main()} side={side()} hidden={!settingPanelShow()} onBackClick={handleBack}/>
                </div>
            </div>
        )
    }

    protected afterRender(): void {
        this.player.nodes.controllerBarMiddleRight.append(this.element)
    }
}