export type DanmakuData = {
    message: string;
    fontColor?: string;
    fontSize?: number;
    fontFamily?: string;
    fontWeight?: number;
    dom?: HTMLElement;
    useTracks?: number;
    width?: number;
    //弹幕的总位移，从最左侧到最右侧的长度
    totalDistance?: number;
    // 弹幕的总的位移时间，用于计算弹幕的速度
    rollTime?: number;
    // 弹幕的位移速度
    rollSpeed?: number;
    // 弹幕的当前位移距离
    rollDistance?: number;
    startTime?: number;
    timestamp?: number;
    y?: number[];
}

export type Track = {
    id: number;
    priority: number;
}