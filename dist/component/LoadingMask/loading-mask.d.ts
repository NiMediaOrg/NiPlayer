import "loading-mask.less";
export declare class LoadingMask {
    private template_;
    private container;
    constructor(container: HTMLElement);
    get template(): string | HTMLElement;
    init(): void;
    generateLoadingMask(): HTMLElement;
    addLoadingMask(): void;
    removeLoadingMask(): void;
}
