import { setting } from "@/assets/svg";
import { UIPlugin } from "@/base/ui.plugin";
import { createSignal, JSX } from "solid-js";
import { IPanelItem, Panel } from "niplayer-components";
import { playrate, ratio, subtitle, rightArrow } from "@/assets/svg";
 
import "./index.less";

export class Setting extends UIPlugin {
    protected name: string = 'ctrl-setting';
    protected panelItems: IPanelItem[] = [
        {
            content: '画面比例',
            icon: ratio,
            tip: '正常',
            button: rightArrow
        },
        {
            content: '倍速',
            icon: playrate,
            tip: '正常',
            button: rightArrow,
        },
        {
            content: '字幕',
            icon: subtitle,
            tip: '关闭',
            button: rightArrow,
        }
    ]

    protected render(): JSX.Element | string | HTMLElement {
        const [ settingPanelShow, setSettingPanelShow ] = createSignal(false);
        const handleClick = () => {
            setSettingPanelShow(v => !v);
        }

        return (
            <div class="niplayer-controller-middle-item niplayer-setting-controller" onClick={handleClick}>
                <div innerHTML={setting} style={{width: '48px', height: '48px'}}></div>
                <div class="niplayer-setting-panel-container">
                    <Panel items={this.panelItems} />
                </div>
            </div>
        )
    }

    protected afterRender(): void {
        this.player.nodes.controllerBarMiddleRight.append(this.element)
    }
}