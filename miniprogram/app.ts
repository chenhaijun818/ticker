// app.ts

import {Client} from "./core/client";
import {UiService} from "./core/ui.service";

const client = new Client();
const ui = new UiService();

// 添加网络拦截, 给每次请求自动加上api域名
client.addBeforeInterceptor((request) => {
  let {url} = request;
  request.url = `http://47.97.111.216:3100/${url}`;
  return request
});

// 添加后置拦截器, 处理返回结果
client.addAfterInterceptor((response) => {
  // 请求失败, http返回状态码不为200
  if (!response) {
    ui.toast('请求失败, 请稍后重试')
    return;
  }

  // 请求成功, 但是返回的结果非预期
  if (response.code !== 200) {
    return;
  }
  return response.data || {};
});

App<IAppOption>({
  globalData: {},
  onLaunch() {
    console.log('on launch')
  },
})