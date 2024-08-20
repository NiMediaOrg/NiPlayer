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
}
export type IRenderType = '2d' | 'bitmaprenderer' | 'webgl' | 'webgl2';