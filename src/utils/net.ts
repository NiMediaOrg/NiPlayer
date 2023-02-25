import { AxiosConfig, AxiosOptions } from "../types/Player";

export class Axios {
  config: AxiosConfig;
  constructor(config: AxiosConfig) {
    this.config = Object.assign(
      {
        baseURL: "https://loaclhost/",
        timeout: 2000,
        headers: {},
      },
      config
    );
  }

  get(url: string, options: AxiosOptions): Promise<any> {
    return new Promise((res, rej) => {
      let controller = new AbortController(); //设置超时控制器
      let path = `${this.config.baseURL}${url}`;
      let id = setTimeout(() => {
        controller.abort();
      }, this.config.timeout);

      if (options.query) {
        path += "?";
        for (let key in options.query) {
          path += `${key}=${options.query[key]}&`;
        }
        path = path.slice(0, path.length - 1);
      }

      fetch(path, {
        method: "GET",
        mode: "cors",
        headers: this.config.header,
        signal: controller.signal,
      })
        .then(
          (res: Response) => {
            if (res.ok === false) {
                window.clearTimeout(id);
                rej("error");
            }
            return res.json();
          },
          (err: Error) => {
            window.clearTimeout(id);
            rej(err);
          }
        )
        .then((value: any) => {
          window.clearTimeout(id);
          res(value);
        });
    });
  }
}
