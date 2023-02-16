import { AxiosConfig, AxiosOptions } from "../types/Player";

export class Axios {
    config: AxiosConfig;
    constructor(config: AxiosConfig) {
        this.config = Object.assign({
            baseURL: "https://loaclhost/",
            timeout: 10000,
            headers:{},
        },config)
    }

    get(url: string, options: AxiosOptions): Promise<any[]> {
        return new Promise((res,rej) => {
            let path = `${this.config.baseURL}${url}`
            if(options.query) {
                path += "?"
                for(let key in options.query) {
                    path += `${key}=${options.query[key]}&`
                }
                path = path.slice(0, path.length-1)
            }

            fetch(path, {
                method: "GET",
                mode: "cors",
                headers: this.config.header,
            }).then((response: Response) => {
                if(response.ok === false) rej("fail")
                return response.json()
            },(err) => {
                rej("fail")
            }).then((value) => {
                res(value);
            },(err) => {
                rej('fail')
            })
        })
        
    }
}