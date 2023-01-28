export type MoovBoxInfo = {
    duration?: number;
    timescale?: number;
    isFragmented?: boolean;
    isProgressive?: boolean;
    hasIOD?: boolean;
    created?: Date;
    modified?: Date;
    tracks?: MediaTrack[];
    [props: string]: any;
};
export type MediaTrack = {
    id: number;
    created?: Date;
    modified?: Date;
    volume?: number;
    track_width?: number;
    track_height?: number;
    timescale?: number;
    duration?: number;
    bitrate?: number;
    codec?: string;
    language?: string;
    [props: string]: any;
};
