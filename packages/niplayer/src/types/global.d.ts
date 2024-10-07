declare global {
    export const DEBUG: boolean;

    export interface TextTrackCue {
        text: string;
    }
}

declare module '.png' {
    const base64: string;
    export default base64;
}

declare module '*.svg' {
    const svg: any;
    export default svg;
}

export {}