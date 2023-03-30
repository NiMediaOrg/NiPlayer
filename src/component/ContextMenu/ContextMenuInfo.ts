import { Player } from "@/page/player";
import { Video } from "@/types/Player";
import { $ } from "@/utils";

// 显示具体的信息
export class ContextMenuInfo {
    readonly id = "ContextMenuInfo";
    el: HTMLElement;
    container: HTMLElement;
    player: Player;
    info: Video;
    constructor(player: Player, container: HTMLElement, info: Video) {
        this.container = container;
        this.player = player;
        this.info = info;
        this.init();
    }   

    init(){
        this.initTemplate();

        this.el.onclick = (e: Event) => {
            e.stopPropagation();
        }
    }

    initTemplate() {
        this.el = $("div.video-context-menu-info",{
            style: {
                display: "none"
            }
        });
        let titleBox = $("div.video-context-menu-infoTitleBox");
        let title = $("div.video-context-menu-infoTitle");
        let close = $("span.close");
        title.innerText = "视频信息统计";
        close.innerText = "X";

        close.onclick = (e:Event) => {
            e.stopPropagation();
            this.el.style.display = "none";
        }
        this.container.append(this.el);
        titleBox.append(title,close);
        this.el.appendChild(titleBox);
        for(let key in this.info) {
            let item = $("div.video-context-menu-infoItem");
            let subTitle = $("span.video-context-menu-infoSubtitle");
            let desc = $("span.video-context-menu-infoDesc");
            this.el.appendChild(item);
            item.append(subTitle,desc);
            if(key === "url") {
                subTitle.innerText = "视频地址："
            } else if(key === "videoCodec") {
                subTitle.innerText = "视频编码规范："
            } else if(key === "audioCodec") {
                subTitle.innerText = "音频编码规范："
            } else if(key === "lastUpdateTime") {
                subTitle.innerText = "最近更新时间："
            } else if(key === "width") {
                subTitle.innerText = "媒体资源宽度："
            } else if(key === "height") {
                subTitle.innerText = "媒体资源高度："
            } else if(key === "isFragmented") {
                subTitle.innerText = "是否为fragmented类型的MP4："
            }
            desc.innerText = this.info[key];
        }
    }
}