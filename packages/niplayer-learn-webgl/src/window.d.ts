declare interface Window {
    layui: {
        use: (fn: () => void) => void;
        slider: {
            render: (options: {
                elem: string;
                max: number;
                min: number;
                change: (val: number) => void;
            }) => void;
        }
    }
}