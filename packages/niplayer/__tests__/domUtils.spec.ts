import { test,expect } from "vitest"
const SELECTOR_REG = /([\w-]+)?(?:#([\w-]+))?(?:\.([\w-]+))?/;
function regxMatch(str: string) {
    let regArray = SELECTOR_REG.exec(str);
    return regArray?.slice(1,4);
}

test("domUtils",()=>{
    expect(regxMatch("div#test-3.nova-4")).toStrictEqual(["div","test-3","nova-4"])
    expect(regxMatch("div.test3-123")).toStrictEqual(["div",undefined,"test3-123"])
    expect(regxMatch("div")).toStrictEqual(["div",undefined,undefined])
})