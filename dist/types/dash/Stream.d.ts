export type ConsumedSegment = {
    data: [ArrayBuffer, ArrayBuffer];
    streamId: number;
    mediaId: number;
};
export type VideoBuffers = Array<{
    start: number;
    end: number;
}>;
