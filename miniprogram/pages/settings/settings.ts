// pages/settings/settings.ts
import {Client} from "../../core/client";
import {Todo} from "../../models/todo";
import {UiService} from "../../core/ui.service";

const client = new Client();
const ui = new UiService();
Page<{
    parent: Todo | null;
    todoList: Todo[];
    delTodo: Todo | null
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
        delTodo: null
    },
    todoMap: new Map(),
    onLoad() {
    },
    onShow() {
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
        const name = await ui.input('请输入待办名称');
        if (!name) {
            return;
        }
        client.post('add', {name}).then(res => {
            if (res) {
                this.getTodoList();
            }
        })
    },
    onDoit(event: any) {
        const now = Date.now();
        wx.setStorageSync('startTime', now);
        const tid = event.detail.tid;
        const todo: Todo = this.todoMap.get(tid) as Todo;
        const todos: Todo[] = [];
        const todoMap = this.todoMap;
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