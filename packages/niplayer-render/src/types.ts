export interface IWaterMarkOptions {
    message: string;
    bold?: boolean;
    fontSize?: number;
    fontFamily?: string;
    color?: string;
}
/**
 * @desc 指定使用的具体渲染类型
 */
export type renderType = 'webgl' | '2d';
export interface IApplicationConfig {
    width: number;
    height: number;
    type?: renderType;
    background?: string;
}

export interface IPoint {
    x: number;
    y: number;
}

export type IRenderType = '2d' | 'bitmaprenderer' | 'webgl' | 'webgl2';