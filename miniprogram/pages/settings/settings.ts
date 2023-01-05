// pages/settings/settings.ts
import {Client} from "../../core/client";
import {Todo} from "../../models/todo";

const client = new Client();
Page<{
    name: string;
    parent: Todo | null;
    todoList: Todo[];
}, {
    getTodoList(): void;
    onChooseParent(): void;
    submit(): void;
}>({
    data: {
        name: '',
        parent: null,
        todoList: []
    },
    onLoad() {
        this.getTodoList();
    },
    getTodoList() {
        client.get('todoList').then((res: any) => {
            const list: Todo[] = [];
            if (res && res.list) {
                res.list.forEach((i: any) => list.push(new Todo(i)))
            }
            this.setData({todoList: list})
        })
    },
    onChooseParent(e: any) {
        const parent = this.data.todoList[e.detail.value];
        this.setData({parent})
    },
    submit() {
        if (!this.data.name) {
            return
        }
        const pid = this.data.parent?.id;
        client.post('add', {name: this.data.name, pid}).then(res => {
            if (res) {
                this.getTodoList();
                this.setData({name: '', parent: null})
            }
        })
    }
})