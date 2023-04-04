import { Player } from "@/page/player";
import MP4Box, {MP4ArrayBuffer, MP4File} from "mp4box"
import { Video } from "..";
import { DownLoader } from "./net/DownLoader";
import { EVENT } from "@/events";
export class Mp4Parser {
    url: string;
    player: Player;
    mp4boxfile: MP4File;
    downloader: DownLoader;
    constructor(url: string, player: Player) {
        this.url = url;
        this.player = player;
        this.mp4boxfile = MP4Box.createFile();
        this.downloader = new DownLoader(url);
        this.init();
    }

    init() {
        this.initEvent();
        this.loadFile();
    }

    initEvent() {
        this.mp4boxfile.onReady = (info) => {
            this.stop(); 
            let videoInfo: Video = {
                url: this.url,
                lastUpdateTime: info.modified,
                videoCodec: info.tracks[0].codec,
                audioCodec: info.tracks[1].codec,
                isFragmented: info.isFragmented,
                width: info.tracks[0].track_width,
                height: info.tracks[0].track_height
            }

            this.player.setVideoInfo(videoInfo);
            this.player.emit(EVENT.MOOV_PARSE_READY);
        }
    }

    //停止当前还在发送中的http请求
    stop() {
        if (!this.downloader.isStopped()) {
            this.downloader.stop();
        }
    }

    /**
     * @description 开始请求加载mp4文件
     */
    loadFile() {
        let ctx = this;
        // 先写死，之后在修改
        this.downloader.setInterval(500);
	    this.downloader.setChunkSize(1000000);
	    this.downloader.setUrl(this.url);
        this.downloader.setCallback(
            // end表示这一次的请求是否已经将整个视频文件加载过来
            function(response: MP4ArrayBuffer, end: boolean, error: any) {
                var nextStart = 0;
                if (response) {
                    // 设置文件加载的进度条
                    // console.log(response)
                    nextStart = ctx.mp4boxfile.appendBuffer(response, end)
                }
                if (end) {
                    // 如果存在end的话则意味着所有的chunk已经加载完毕
                    ctx.mp4boxfile.flush();
                } else {
                    ctx.downloader.setChunkStart(nextStart); 			
                }
                if (error) {
                    //TODO 待定
                }
            }
        )

        this.downloader.start();
    }
}