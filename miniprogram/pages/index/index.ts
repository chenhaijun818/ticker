// index.ts
import {Client} from "../../core/client";
import {Todo} from "../../models/todo";

const client = new Client();
Page({
    data: {
        todoList: [] as any,
        todos: [] as any,
        countup: 0,
        todoTime: 30 * 60 * 1000
    },
    ticker: 0,
    todoMap: new Map(),
    todoList: [] as any,
    onLoad() {

    },
    onShow() {
        this.getTodoList().then(() => {
            const startTime = wx.getStorageSync('startTime');
            if (startTime) {
                this.startTick();
                this.setTodos();
            }
        });
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
                this.data.todoList[0] = todoList;
                this.todoList = todoList;
                this.setData({todoList: this.data.todoList})
            }
        })
    },
    // 开始循环
    startTick() {
        if (this.ticker) {
            clearInterval(this.ticker);
        }
        this.ticker = setInterval(() => {
            const startTime = wx.getStorageSync('startTime');
            if (!startTime) {
                return;
            }
            const now = Date.now();
            const usedTime = now - startTime;
            this.setData({countup: usedTime})
        }, 1000);
    },
    // 开始学习
    startStudy() {
        const now = Date.now();
        wx.setStorageSync('startTime', now);
        const todos: Todo[] = this.chooseTodo([]);
        const ids = todos.map(t => t.id).join(',')
        wx.setStorageSync('tids', ids);
        this.setTodos();
        this.startTick();
    },
    // 开始休息
    startRest() {
        const now = Date.now();
        wx.setStorageSync('startTime', now);
        wx.removeStorageSync('tids');
        this.setTodos();
        this.startTick();
    },
    // 随机选择一个待办事项
    chooseTodo(todos: Todo[]): Todo[] {
        if (!todos.length) {
            const todo: Todo = this.random(this.todoList);
            todos.push(todo);
        }
        const todo = todos[todos.length - 1];
        if (!todo!.children.length) {
            return todos
        }
        const child = this.random(todo.children);
        todos.push(child);
        return this.chooseTodo(todos);
    },
    // 根据选择的待办id生成待办项的数据
    setTodos() {
        const tids = wx.getStorageSync('tids');
        const todos = tids.split(',').filter((tid: string) => tid).map((tid: string) => this.todoMap.get(tid))
        this.setData({todos});
    },
    // 随机选取数组的其中一个
    random(list: Todo[]): Todo {
        const index = Math.floor(Math.random() * list.length);
        return list[index];
    }
})
