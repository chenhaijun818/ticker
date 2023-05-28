// components/login/login.ts
import {Client} from "../../core/client";

const client = new Client();

Component({
    /**
     * 组件的属性列表
     */
    properties: {},

    /**
     * 组件的初始数据
     */
    data: {},
    /**
     * 组件的方法列表
     */
    methods: {
        login() {
            wx.login().then(data => {
                client.post('login', {code: data.code}, {verify: false}).then((res: any) => {
                    if (res && res.token) {
                        wx.setStorageSync('token', res.token);
                        this.triggerEvent('logged')
                    }
                })
            })
        }
    }
})
