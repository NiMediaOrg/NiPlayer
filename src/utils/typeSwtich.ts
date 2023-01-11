export function string2booolean(s:string | null): boolean | null {
    if(s === "true") {
        return true;
    } else if(s === "false") {
        return false;
    } else {
        return null;
    }
}

export function string2number(s:string | null) : number | null{
    let n = Number(s);
    if(isNaN(n)) return n;
    else return null;
}