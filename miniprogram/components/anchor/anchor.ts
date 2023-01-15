import {ModalService} from "../../core/modal.service";

const modal = new ModalService();

// core/components/anchor/anchor.ts
Component({
    /**
     * 组件的属性列表
     */
    properties: {},

    /**
     * 组件的初始数据
     */
    data: {
        modals: [] as Array<any>
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
            })
        },
        onConfirm(e: any) {
            const id: string = e.currentTarget.dataset.id;
            modal.dismiss({
                id: id,
                value: '',
                confirm: true,
                cancel: false
            })
        },
        touchmove() {
            return false
        }
    },
    lifetimes: {
        created() {
            modal.onShow((modal: any) => {
                const modals = this.data.modals;
                modals.push(modal)
                this.setData({modals})
            });
            modal.onDismiss((modal: any) => {
                const m = this.data.modals.find(mm => mm.id === modal.id);
                if (m) {
                    const modals = this.data.modals.filter(mm => mm !== m);
                    this.setData({modals})
                }
            })
        }
    }
})
