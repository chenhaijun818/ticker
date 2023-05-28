import {UiService} from "../../core/ui.service";
import {Client} from "../../core/client";

const ui = new UiService();
const client = new Client();
Component({
    properties: {
        todo: {
            type: Object
        }
    },
    data: {
        close: true
    },
    lifetimes: {
        attached() {
        }
    },
    methods: {
        toggle() {
            this.setData({close: !this.data.close})
        },
        onActionSheet() {
            wx.showActionSheet({
                itemList: ['修改', '添加子项目', '删除项目', '立即执行', '禁用/启用']
            }).then(res => {
                if (res.tapIndex === 0) {
                    this.edit();
                }
                if (res.tapIndex === 1) {
                    this.add();
                }
                if (res.tapIndex === 2) {
                    this.remove();
                }
                if (res.tapIndex === 3) {
                    this.doit()
                }
            }).catch(console.log)
        },
        async edit() {
            const todo = this.data.todo;
            const [name, time, enable] = await ui.input('请输入任务信息', [
                {placeholder: '任务名称', type: 'text', value: todo.name},
                {placeholder: '任务时长(分钟)', type: 'text', value: todo.time},
                {placeholder: '是否启用', type: 'radio', value: todo.enable}
            ]);
            console.log(name, time, enable)
            if (!name) {
                return;
            }
            client.post('update', {name, time, enable, id: todo.id}).then(res => {
                if (res) {
                    ui.toast('修改成功')
                    this.triggerEvent('change')
                }
            })
        },
        async add() {
            const [name, time, enable] = await ui.input('请输入任务信息', [
                {placeholder: '任务名称', type: 'text'},
                {placeholder: '任务时长(分钟)', type: 'text'},
                {placeholder: '是否启用', type: 'radio'}
            ]);
            if (!name) {
                return;
            }
            client.post('add', {name, time, enable, pid: this.data.todo.id}).then(res => {
                if (res) {
                    ui.toast('添加成功')
                    this.triggerEvent('change')
                }
            })
        },
        async remove() {
            const confirm = await ui.confirm('您确定要删除该待办吗？');
            if (!confirm) {
                return
            }
            client.post('delete', {id: this.data.todo.id}).then(res => {
                if (res) {
                    ui.toast('删除成功');
                    this.triggerEvent('change')
                }
            })
        },
        doit() {
            this.triggerEvent('doit', {tid: this.data.todo.id})
            // wx.navigateTo({url: `/pages/index/index?todo=${this.data.todo.id}`})
            // wx.switchTab({url: `/pages/index/index?todo=${this.data.todo.id}`})
        },
        onDoit(event: any) {
            this.triggerEvent('doit', event.detail)
        },
        onChange() {
            this.triggerEvent('change')
        }
    }
});
