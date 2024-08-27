export const AssetsLoader  = {
    load(url: string) {
        //todo 加载json文件，加载mp4等更多类型的资源
        return new Promise((resolve, reject) => {
            const image = new Image();
            image.src = url;
            image.onload = () => {
                resolve(image);
            }
            image.onerror = (err) => {
                reject(err);
            }
        })
    }
}