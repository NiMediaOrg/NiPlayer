declare global {
    export const DEBUG: boolean;
}

declare module '.png' {
    const base64: string;
    export default base64;
}

export {}