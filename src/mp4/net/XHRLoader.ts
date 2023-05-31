import { XHRConfig } from '@/types/mp4'

export class XHRLoader {
    constructor() {}

    setup() {}

    load(config: XHRConfig) {
        let request = config.request
        let xhr: XMLHttpRequest
        if (request.xhr) {
            xhr = request.xhr
        } else {
            xhr = new XMLHttpRequest()
            request.xhr = xhr
        }
        xhr.open(request.method || 'get', request.url)
        xhr.responseType = request.responseType as XMLHttpRequestResponseType
        if (request.header) {
            for (let key in request.header) {
                xhr.setRequestHeader(key, request.header[key])
            }
        }
        xhr.onreadystatechange = (e) => {
            if (xhr.readyState === 4) {
                if (
                    (xhr.status >= 200 && xhr.status < 300) ||
                    xhr.status === 304
                ) {
                    config.success && config.success.call(xhr, xhr.response)
                } else {
                    config.error && config.error.call(xhr, e)
                }
            }
        }

        xhr.onabort = (e) => {
            config.abort && config.abort.call(xhr, e)
        }

        xhr.onerror = (e) => {
            config.error && config.error.call(xhr, e)
        }

        xhr.onprogress = (e) => {
            config.progress && config.progress.call(xhr, e)
        }

        xhr.send()
    }
}
