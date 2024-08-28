import { IDanmakuEngineConfig } from ".";

export const defaultConfig: Partial<IDanmakuEngineConfig> = {
    fontSize: 30,
    fontFamily: 'Arial',
    bold: false,
    color: '#fff',
    duration: 4.5,
    timeline: () => window.performance.now() / 1000,
}