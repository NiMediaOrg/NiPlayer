import {test,expect} from "vitest"
import {computeAngle} from "../src/utils"
test("computeAngle",()=>{
    expect(computeAngle(30,30)).toBe(45);
    expect(computeAngle(0,100)).toBe(90)
    expect(computeAngle(100,0)).toBe(0)
})