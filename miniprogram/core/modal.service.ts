import {getRandomString} from "./utils/get-random-string";

// import {nanoid} from "nanoid";

interface Modal {
    id: string,
    complete: Function
}

interface ModalOptions {
    content?: string,
    title?: string,
    confirmText?: string,
    cancelText?: string,
    confirmColor?: string,
    cancelColor?: string,
    titleColor?: string
    editable?: boolean;

    success?(res: any): void
}

interface DismissResult {
    id: string,
    value: string,
    confirm: boolean,
    cancel: boolean
}

export class ModalService {
    static instance: ModalService;

    modals: Array<Modal> = [];
    onShowSubscribers: Array<Function> = [];
    onDismissSubscribers: Array<Function> = [];

    constructor() {

        return ModalService.instance = ModalService.instance || this;
    }

    showModal(options: ModalOptions) {
        const id = getRandomString();
        const p: any = new Promise(resolve => {
            let m = {
                id: id,
                title: options.title,
                content: options.content,
                titleColor: options.titleColor,
                confirmText: options.confirmText || '确认',
                cancelText: options.cancelText || '取消',
                editable: options.editable,
                complete: (res: any) => {
                    if (options.editable) {
                        if (typeof options.success === 'function') {
                            options.success(res.value);
                        }
                        resolve(res.value);
                    } else {
                        if (typeof options.success === 'function') {
                            options.success(res.confirm);
                        }
                        resolve(res.confirm);
                    }
                }
            };
            this.modals.push(m)
            // publish
            this.onShowSubscribers.forEach(fn => fn(m))
        });
        p.dismiss = () => {
            this.dismiss({id, confirm: false, cancel: true, value: ''})
        }
        return p;
    }

    dismiss(result: DismissResult) {
        let modal = this.modals.find(m => m.id === result.id);
        if (modal) {
            modal.complete(result);
            this.modals = this.modals.filter(m => m !== modal);
            this.onDismissSubscribers.forEach(fn => fn(modal));
        }
    }

    onShow(fn: Function) {
        this.onShowSubscribers.push(fn)
    }

    onDismiss(fn: Function) {
        this.onDismissSubscribers.push(fn);
    }

}
