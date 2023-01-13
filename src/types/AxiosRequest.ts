export type AxiosMethod = "get" | "post" | "put" | "delete" | "patch" | "option";

export type AxiosQuery = {
    [props:string]:string | number | boolean;
}
export type AxiosContentType = "application/x-www-form-urlencoded" | "multipart/form-data" | "application/json" | "text/xml";
export type AxiosData = XMLHttpRequestBodyInit;
export type AxiosHeader = {
    "Content-Type"?: AxiosContentType;
    "Range"?:string;
    "Authroization"?:string;
}