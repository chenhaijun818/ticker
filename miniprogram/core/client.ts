// 定义前置拦截器
interface BeforeInterceptor {
    (request: Request): Request | undefined
}

/*
*   定义前置拦截器参数
*   @param header 本次请求的header
*   @param url 本次请求的url
*   @param params 本次请求要携带的参数
*   @param verify 本次请求是否要验证登录信息
* */
interface Request {
    header: any;
    params: object;
    url: string;
    verify: boolean;
    method: 'GET' | 'POST';
}

// 定义后置拦截器
interface AfterInterceptor {
    (response: Response): Response | undefined
}

/*
*   定义请求返回结果
*   @param code 请求结果的状态码
*   @param data 请求结果返回的数据
*   @param message 请求结果的文字说明
* */
interface Response {
    code: number;
    data: any;
    message: string;
    options?: any;
}


// 主类
export class Client {
    // 实现单例模式
    static instance: Client;
    // 存放前置拦截器
    beforeInterceptors: BeforeInterceptor[] = [];
    // 存放后置拦截器
    afterInterceptors: AfterInterceptor[] = [];

    constructor() {
        return Client.instance = Client.instance || this;
    }

    // 封装GET请求
    get(endpoint: string, params: any = {}, options = {}) {
        return this.request({method: 'GET', endpoint, params, options});
    }

    // 封装POST请求
    post(endpoint: string, params: any = {}, options = {}) {
        return this.request({method: 'POST', endpoint, params, options});
    }

    // 封装PUT请求
    put(endpoint: string, params: any = {}, options = {}) {
        return this.request({method: 'PUT', endpoint, params, options});
    }

    // 发起请求
    async request({method, endpoint, params, options}: any): Promise<object | void> {
        options.verify = options.verify || typeof options.verify === 'undefined';   // 如果没传verify, 默认为true
        let header: any = options.header || {};
        let request: Request = {
            method,
            header,
            url: endpoint,
            params,
            verify: options.verify
        }
        // 执行所有前置拦截器, 并传入本次请求的相关数据
        request = this.callBeforeInterceptors(request);
        // 如果有拦截器触发了拦截, 就终止请求
        if (!request) {
            console.log('拦截成功, 请求被终止')
            return;
        }
        let response: Response = {} as Response;
        response.options = options;
        return new Promise((resolve) => {
            wx.request({
                method: request.method,
                url: request.url,
                header: request.header,
                data: request.params,
                success: (res) => {
                    const data: any = res.data;
                    response.code = data.code
                    response.data = data.data
                    response.message = data.message
                    // 执行所有后置拦截器
                    response = this.callAfterInterceptors(response)
                    resolve(response);
                },
                fail: (err) => {
                    console.log(err)
                    // 执行所有后置拦截器
                    this.callAfterInterceptors();
                    resolve();
                }
            })
        })
    }

    // 添加一个请求前拦截器
    addBeforeInterceptor(interceptor: BeforeInterceptor) {
        this.beforeInterceptors.push(interceptor);
    }

    // 添加一个请求后拦截器
    addAfterInterceptor(interceptor: AfterInterceptor) {
        this.afterInterceptors.push(interceptor);
    }

    // 执行所有前置拦截器
    callBeforeInterceptors(request: Request): Request {
        for (let bi of this.beforeInterceptors) {
            if (!request) {
                continue;
            }
            request = bi(request) as Request;
        }
        return request;
    }

    // 执行所有后置拦截器
    callAfterInterceptors(response?: Response): Response {
        for (let ai of this.afterInterceptors) {
            response = ai(response as Response) as Response;
            if (!response) {
                break;
            }
        }
        return response as Response;
    }

}
