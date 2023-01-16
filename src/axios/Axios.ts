import { AxiosData, AxiosHeader, AxiosMethod, AxiosReturnType } from "../types/AxiosRequest";

function sendRequest(
  url: string,
  method: AxiosMethod,
  header: AxiosHeader = {},
  responseType: XMLHttpRequestResponseType = "text",
  data?: AxiosData
): Promise<AxiosReturnType> {
  return new Promise((res, rej) => {
    let xhr = new XMLHttpRequest();
    xhr.open(method, url);
    for (let index in header) {
      xhr.setRequestHeader(index, header[index]);
    }
    xhr.responseType = responseType;
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        if ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304) {
          res({
            status: "success",
            data: xhr.response,
          });
        } else {
          rej({
            status: "fail",
            data: xhr.response,
          });
        }
      }
    };
    xhr.send(data);
  });
}

export class Axios{
  constructor(
    public url?: string,
    public method?: AxiosMethod,
    public header?: AxiosHeader,
    public responseType?: XMLHttpRequestResponseType,
    public data?: AxiosData
  ) {}

  get(url:string,header?:AxiosHeader,responseType?:XMLHttpRequestResponseType) {
    return sendRequest(url,"get",header,responseType);
  }

  post(url:string,header?:AxiosHeader,responseType?:XMLHttpRequestResponseType,data?:AxiosData) {
    return sendRequest(url,"post",header,responseType,data);
  }
};
