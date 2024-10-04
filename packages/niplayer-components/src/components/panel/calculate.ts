import { IPanel } from ".";
import { FONT_SIZE, HEADER_HEIGHT, ICON_HEIGHT, PADDING_BOTTOM, PADDING_TOP } from "./constants";

export const calculateSize = (panel: IPanel): {
    height: number;
    width: number;
} => {
    if (!panel?.items) return null;
    const paddingPerItem = PADDING_BOTTOM + PADDING_TOP;
    const heightPerItem = Math.max(FONT_SIZE, ICON_HEIGHT);
    const height = (panel.items?.length || 0) * (heightPerItem + paddingPerItem) + (panel.headerIcon ? HEADER_HEIGHT : 0);
    return {
        height,
        width: 100
    }
}