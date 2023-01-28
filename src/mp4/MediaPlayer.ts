import MP4Box ,{ MP4File, Log } from "mp4box"
import { MoovBoxInfo, MediaTrack } from "../types/mp4";
class MediaPlayer {
    url: string;
    video: HTMLVideoElement;
    mp4boxfile: MP4File;
    mediaSource: MediaSource;
    constructor(url:string, video:HTMLVideoElement) {
        this.url = url;
        this.video = video;
        this.init()
    }

    init() {
        this.mp4boxfile = MP4Box.createFile();
        this.initEvent();
    }

    initEvent() {
        this.mp4boxfile.onMoovStart = function () {
            Log.info("Application", "Starting to parse movie information");
        }
        this.mp4boxfile.onReady = function (info: MoovBoxInfo) {
            debugger
            Log.info("Application", "Movie information received");
            if (info.isFragmented) {
                this.mediaSource.duration = info.fragment_duration/info.timescale;
            } else {
                this.mediaSource.duration = info.duration/info.timescale;
            }
            this.addSourceBufferListener(info);
            stop();
        }
    }
    /**
     * @description 根据传入的媒体轨道的类型构建对应的SourceBuffer
     * @param mp4track 
     */
    addBuffer(mp4track: MediaTrack) {
        var track_id = mp4track.id;
        var codec = mp4track.codec;
        var mime = 'video/mp4; codecs=\"'+codec+'\"';
        // var kind = mp4track.kind;
        var sb: SourceBuffer & {[props:string]: any};
        if (MediaSource.isTypeSupported(mime)) {
            try {
                Log.info("MSE - SourceBuffer #"+track_id,"Creation with type '"+mime+"'");
                // 根据moov box中解析出来的track去一一创建对应的sourcebuffer
                sb = this.mediaSource.addSourceBuffer(mime);
                sb.addEventListener("error", function(e) {
                    Log.error("MSE SourceBuffer #"+track_id , e);
                });
                sb.ms = this.mediaSource;
                sb.id = track_id;
                this.mp4boxfile.setSegmentOptions(track_id, sb);
                sb.pendingAppends = [];
            } catch (e) {
                Log.error("MSE - SourceBuffer #"+track_id,"Cannot create buffer with type '"+mime+"'" + e);
            }
        } 
    }

    addSourceBufferListener(info: MoovBoxInfo) {
        for (var i = 0; i < info.tracks.length; i++) {
            var track = info.tracks[i];
            this.addBuffer(track);
        }
    }
}

export default MediaPlayer;