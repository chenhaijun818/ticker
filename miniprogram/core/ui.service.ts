import {ModalService} from "./modal.service";

const modal = new ModalService();

// 封装一些常用弹窗和提示的ui方法
export class UiService {
    private static instance: any;

    constructor() {
        UiService.instance = UiService.instance || this;
        return UiService.instance;
    }

    /*
    * 弹出一条提示，异步，无返回值
    * @param msg 提示的内容
    * */
    toast(msg: any, mask = false, icon: any = 'none', duration = 1500): Promise<void> {
        wx.showToast({
            title: msg,
            icon: icon,
            mask: mask,
            duration: duration
        });
        return new Promise(resolve => {
            setTimeout(resolve, duration);
        });
    }

    /*
    *  打开一个提示弹窗，异步，无返回值
    *  @param msg 提示的内容
    * */
    alert(msg: any, title = '提示'): Promise<void> {
        return new Promise(resolve => {
            wx.showModal({
                title: title,
                content: msg,
                showCancel: false,
                success: () => {
                    resolve();
                }
            });
        });
    }

    /*
    *   打开一个确认弹窗
    *   @param msg 需要确认的内容
    *   @param title 弹窗标题
    *   @param options 其它配置
    *   @returns Promise<boolean> 异步返回用户的选择
    * */
    confirm(msg: any, title = '提示', options: any = {}): Promise<boolean> {
        options.confirmText = options.confirmText || '确定';
        options.confirmColor = options.confirmColor || '#333';
        options.cancelColor = options.cancelColor || '#999';
        options.cancelText = options.cancelText || '取消';
        options.title = title;
        options.content = msg;
        return modal.showModal(options);
    }

    /*
    *   弹窗输入
    * */
    input(title: string): Promise<string | void> {
        return new Promise(resolve => {
            wx.showModal({
                title,
                editable: true,
                placeholderText: '请输入',
                success(res) {
                    if (res.confirm && res.content) {
                        resolve(res.content);
                    } else {
                        resolve();
                    }
                }
            })
        })
    }

    /*
    *   打开一个底部选择框
    *   @param options 可供选择的列表
    * */
    actionSheet(options: Array<any> = []): Promise<string> {
        return wx.showActionSheet({
            itemList: options
        }).then(res => {
            return String(res.tapIndex)
        }).catch(() => {
            return '';
        })
    }

    /*
    *   打开加载弹窗
    *   @param msg 弹窗的提示内容
    * */
    loading(msg = '正在请求'): void {
        wx.showLoading({
            title: msg,
            mask: true
        });
    }

    /*
    *   关闭加载弹窗
    * */
    dismiss(): void {
        wx.hideLoading();
    }

}
