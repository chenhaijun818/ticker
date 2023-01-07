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
    data: {},
    lifetimes: {
        attached() {
        }
    },
    methods: {
        async add() {
            const name = await ui.input('请输入待办名称');
            if (!name) {
                return
            }
            client.post('add', {name, pid: this.data.todo.id}).then(res => {
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
        onChange() {
            this.triggerEvent('change')
        }
    }
});
