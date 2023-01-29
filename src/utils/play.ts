export function getFileExtension(file:string): string | never {
    for(let i = file.length - 1; i>=0 ;i--) {
        if(file[i] ==='.') {
            return file.slice(i + 1,file.length);
        }
    }
    throw new Error("传入的文件没有扩展名")
}