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
        value: ''
        // modals: [] as Array<any>
    },

    /**
     * 组件的方法列表
     */
    methods: {
        onCancel(e: any) {
            const id: string = e.currentTarget.dataset.id;
            modal.dismiss({
                id: id,
                value: '',
                confirm: false,
                cancel: true
            });
            this.triggerEvent('cancel')
        },
        onConfirm(e: any) {
            const id: string = e.currentTarget.dataset.id;
            modal.dismiss({
                id: id,
                value: this.data.value,
                confirm: true,
                cancel: false
            });
            this.triggerEvent('confirm')
        }
    }
})
