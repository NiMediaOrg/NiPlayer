import URLUtilsFactory, { URLUtils } from "../src/dash/utils/URLUtils";
import {test,expect} from "vitest"
let urlUtils:URLUtils = new URLUtils({});

test("resolve_absolute_1",()=>{
    let a = "https://www.baidu.com/";
    let b = "/ad";
    let c = "/res.mp4"
    expect(urlUtils.resolve(a,b,c)).toBe("https://www.baidu.com/ad/res.mp4");
})

test("resolve_absolute_2",()=>{
    let a = "https://www.baidu/ad"
    let b = "/zh/"
    let c = "/cn"
    expect(urlUtils.resolve(a,b,c)).toBe("https://www.baidu/ad/zh/cn");
})
