// pages/settings/settings.ts
import {Client} from "../../core/client";
import {Todo} from "../../models/todo";
import {UiService} from "../../core/ui.service";

const client = new Client();
const ui = new UiService();
Page<{
    parent: Todo | null;
    todoList: Todo[];
    delTodo: Todo | null;
    token: string;
}, {
    getTodoList(): void;
    onChooseParent(e: any): void;
    onChooseDelete(e: any): void;
    add(): void;
    delete(): void;
    onDoit(event: any): void;
    todoMap: Map<string, Todo>;
}>({
    data: {
        parent: null,
        todoList: [],
        delTodo: null,
        token: ''
    },
    todoMap: new Map(),
    onLoad() {
    },
    onShow() {
        this.setData({token: wx.getStorageSync('token')})
        this.getTodoList();
    },
    getTodoList() {
        return client.get('todoList').then((res: any) => {
            if (res && res.list) {
                const list: Todo[] = [];
                const todoList: any[] = [];
                const map: any = {};
                res.list.forEach((i: any) => {
                    const todo = new Todo(i);
                    list.push(todo);
                    this.todoMap.set(todo.id, todo);
                    const pid = todo.pid || 'root';
                    if (map[pid]) {
                        map[pid].push(todo)
                    } else {
                        map[pid] = [todo];
                    }
                });
                const pids = Object.keys(map);
                pids.forEach((pid: string) => {
                    if (pid === 'root') {
                        todoList.push(...map[pid])
                    } else {
                        const parent: any = list.find(todo => todo.id === pid);
                        if (parent) {
                            parent.children.push(...map[pid])
                        } else {
                            todoList.push(...map[pid])
                        }
                    }
                });
                this.setData({todoList: todoList})
            }
        })
    },
    onChooseParent(e: any) {
        const parent = this.data.todoList[e.detail.value];
        this.setData({parent})
    },
    onChooseDelete(e: any) {
        const delTodo = this.data.todoList[e.detail.value];
        this.setData({delTodo})
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
        client.post('add', {name, time, enable}).then(res => {
            if (res) {
                this.getTodoList();
            }
        })
    },
    onDoit(event: any) {
        const now = Date.now();
        const tid = event.detail.tid;
        const todo: Todo = this.todoMap.get(tid) as Todo;
        if (!todo.enable) {
            ui.toast('该项目已被禁用')
            return
        }
        const todos: Todo[] = [];
        const todoMap = this.todoMap;
        wx.setStorageSync('startTime', now);
        setTodos(todo);
        const ids = todos.map(t => t.id).join(',')
        wx.setStorageSync('tids', ids);
        wx.switchTab({url: '/pages/index/index'})

        function setTodos(todo: Todo) {
            todos.unshift(todo);
            if (todo.pid) {
                const parent = todoMap.get(todo.pid);
                if (parent) {
                    setTodos(parent)
                }
            }
        }
    },
    delete() {
        ui.confirm('您确定要删除该待办吗？').then(confirm => {
            if (confirm) {
                client.post('delete', {id: this.data.delTodo?.id}).then(res => {
                    if (res) {
                        ui.toast('删除成功')
                    }
                })
            }
        })
    }
})