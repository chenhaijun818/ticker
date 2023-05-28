import {ModalService} from "../../core/modal.service";

const modal = new ModalService();

// core/components/modal/modal.ts
Component({
    options: {
        multipleSlots: true
    },
    /**
     * 组件的属性列表
     */
    properties: {
        modal: {
            type: Object
        }
    },

    /**
     * 组件的初始数据
     */
    data: {
        values: [] as any
    },
    lifetimes: {
        attached() {
            this.data.modal.items.forEach((e: any, i: any) => {
                this.data.values[i] = e.value;
            })
        }
    },
    /**
     * 组件的方法列表
     */
    methods: {
        onCancel(e: any) {
            const id: string = e.currentTarget.dataset.id;
            modal.dismiss({
                id: id,
                values: [],
                confirm: false,
                cancel: true
            });
            this.triggerEvent('cancel')
        },
        onConfirm(e: any) {
            const id: string = e.currentTarget.dataset.id;
            modal.dismiss({
                id: id,
                values: this.data.values,
                confirm: true,
                cancel: false
            });
            this.triggerEvent('confirm')
        },
        // 输入事件
        onInput(e: any) {
            const index = e.currentTarget.dataset.index;
            this.data.values[index] = e.detail.value;
        },
        // 选择事件
        onChange(e: any) {
            const index = e.currentTarget.dataset.index;
            this.data.values[index] = e.detail.value;
        }
    }
})
