import {test,expect} from "vitest"
import {getFileExtension } from "../src/utils/play"

test("extension",()=>{
    expect(getFileExtension("http://souhu.cc/test.mp4")).toBe("mp4");
    expect(getFileExtension("https://127.0.0.1/manifest.mpd")).toBe("mpd");
    expect(getFileExtension("https://a0.muscache.com/airbnb/static/Paris-P1-1.mp4")).toBe("mp4")
})