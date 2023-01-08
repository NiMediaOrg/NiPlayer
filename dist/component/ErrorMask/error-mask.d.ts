import "./error-mask.less";
export declare class ErrorMask {
    private template_;
    private container;
    constructor(container: HTMLElement);
    get template(): string | HTMLElement;
    init(): void;
    generateErrorMask(): HTMLElement;
    addErrorMask(): void;
    removeErrorMask(): void;
}
