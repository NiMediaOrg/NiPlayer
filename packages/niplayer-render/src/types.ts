export interface IWaterMarkOptions {
    message: string;
    bold?: boolean;
    fontSize?: number;
    fontFamily?: string;
    color?: string;
}

export interface IApplicationConfig {
    width: number;
    height: number;
    background?: string;
}

export interface IPoint {
    x: number;
    y: number;
}

export type IRenderType = '2d' | 'bitmaprenderer' | 'webgl' | 'webgl2';