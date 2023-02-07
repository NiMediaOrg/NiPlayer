export function getFileExtension(file:string): string | never {
    for(let i = file.length - 1; i>=0 ;i--) {
        if(file[i] ==='.') {
            return file.slice(i + 1,file.length);
        }
    }
    throw new Error("传入的文件没有扩展名")
}

export function computeAngle(dx:number,dy:number): number {
    if(dx === 0) return 90;
    if(dy === 0) return 0;
    return Math.round(Math.atan(Math.abs(dy)/Math.abs(dx)) * 180 / Math.PI);
}