import { FullScreen } from "../component/ToolBar/BottomBar/parts/FullScreen";
import { PlayButton } from "../component/ToolBar/BottomBar/parts/PlayButton";
import { Volume } from "../component/ToolBar/BottomBar/parts/Volume";
import { ComponentItem } from "../types/Player";

// COMPONENT_STORE存储目前还展示在视图上的组件，也就是没用卸载或者删除的组件
export const COMPONENT_STORE = new Map<string, ComponentItem>();
// ONCE_COMPONENT_STORE存储的是只要曾经在视图上展示过哪怕已经卸载，都会一直保留在此处，除非通过delete进行彻底删除
export const ONCE_COMPONENT_STORE = new Map<string, ComponentItem>();
// 存储需要隐藏的元素，但不进行卸载
export const HIDEEN_COMPONENT_STORE = new Map<string, ComponentItem>();

// 内置的Controller原子组件
export const BuiltInControllerComponent = [
  "DurationShow",
  "FullPage",
  "FullScreen",
  "PicInPic",
  "PlayButton",
  "Playrate",
  "ScreenShot",
  "SubSetting",
  "VideoShot",
  "Volume",
  "VolumeCompletedProgress",
];
//内置的Progress原子组件
export const BuiltInProgressComponent = [
    "BufferedProgress",
    "CompletedProgress",
    "Dot"
]
export function storeControlComponent(item: ComponentItem) {
  COMPONENT_STORE.set(item.id, item);
  ONCE_COMPONENT_STORE.set(item.id, item);
}