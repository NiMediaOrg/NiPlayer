import {test,expect} from "vitest"
import { getExtension } from "../src/utils"
test("getExtension", () => {
    expect(getExtension('https://jsdeliver.cdn/446-bps-media.mpd')).toBe("mpd");
    expect(getExtension("https://baidu")).toBe("https://baidu");
})