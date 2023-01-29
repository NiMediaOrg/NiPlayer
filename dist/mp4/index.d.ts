declare module 'mp4box' {
    interface MP4MediaTrack {
        id: number;
        created: Date;
        modified: Date;
        movie_duration: number;
        layer: number;
        alternate_group: number;
        volume: number;
        track_width: number;
        track_height: number;
        timescale: number;
        duration: number;
        bitrate: number;
        codec: string;
        language: string;
        nb_samples: number;
    }

    interface MP4VideoData {
        width: number;
        height: number;
    }

    interface MP4VideoTrack extends MP4MediaTrack {
        video: MP4VideoData;
    }

    interface MP4AudioData {
        sample_rate: number;
        channel_count: number;
        sample_size: number;
    }

    interface MP4AudioTrack extends MP4MediaTrack {
        audio: MP4AudioData;
    }

    type MP4Track = MP4VideoTrack | MP4AudioTrack;

    interface MP4Info {
        duration: number;
        timescale: number;
        fragment_duration: number;
        isFragmented: boolean;
        isProgressive: boolean;
        hasIOD: boolean;
        brands: string[];
        created: Date;
        modified: Date;
        tracks: MP4Track[];
    }

    interface LogInterface {
        debug: (module: string,msg: string) => void;
        log: (module: string,msg: string) => void;
        info: (module: string,msg: string) => void;
        warn: (module: string,msg: string) => void;
        error: (module: string,msg: any) => void;
        [props:string]: any;
    }

    export type MP4ArrayBuffer = ArrayBuffer & {fileStart: number};

    export interface MP4File {

        onMoovStart?: () => void;
        onReady?: (info: MP4Info) => void;
        onError?: (e: string) => void;

        appendBuffer(data: MP4ArrayBuffer): number;
        setSegmentOptions(id:number,sb:SourceBuffer): void;
        start(): void;
        stop(): void;
        flush(): void;
    }

    export const Log: LogInterface;

    export function createFile(): MP4File;

    export { };
}