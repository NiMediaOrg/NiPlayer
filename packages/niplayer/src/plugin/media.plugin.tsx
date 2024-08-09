import { UIPlugin } from "@/base/ui.plugin";
import { createSignal } from "solid-js";
export class MediaPlugin extends UIPlugin {
    protected name: string = 'media-demo';

    protected render() {
        const [ getCount, setCount ] = createSignal(0);
        return (
            <div onClick={() => setCount(c => c + 1)} style={{cursor: 'pointer', "user-select": 'none'}}>The count is {getCount()}</div>
        )
    }
}