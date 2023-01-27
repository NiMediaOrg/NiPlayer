import { Player } from "../page/player";
export type PlayerOptions = {
    url: string;
    container: HTMLElement;
    autoplay?: boolean;
    width?: string;
    height?: string;
};
export type DOMProps = {
    className?: string[];
    id?: string;
    style?: Partial<CSSStyleDeclaration>;
    [props: string]: any;
};
export interface ComponentItem {
    id: string;
    el: HTMLElement;
    props: DOMProps;
    [props: string]: any;
}
export interface Node {
    id: string;
    el: HTMLElement;
}
export type Plugin = {
    install: (player: Player) => any;
};
export type registerOptions = {
    replaceElementType?: "replaceOuterHTMLOfComponent" | "replaceInnerHTMLOfComponent";
};
export type getFunctionParametersType<T extends (...args: any[]) => any> = T extends (...args: (infer T)[]) => infer U ? T : never;
