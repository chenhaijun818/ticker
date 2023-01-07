// index.ts
import {Client} from "../../core/client";
import {Todo} from "../../models/todo";

const client = new Client();
Page({
    data: {
        todoList: [] as any,
        todos: [] as any,
        countdown: 0,
        countup: 0
    },
    ticker: 0,
    todoMap: new Map(),
    todoList: [] as any,
    onLoad() {
        this.getTodoList().then(() => {
            this.startTick();
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
    startTick() {
        if (this.ticker) {
            clearInterval(this.ticker);
        }
        this.ticker = setInterval(() => {
            const startTime = wx.getStorageSync('startTime');
            if (!startTime) {
                return;
            }
            const time = 30 * 60 * 1000;
            const now = Date.now();
            const usedTime = now - startTime;
            const tids = wx.getStorageSync('tids');
            const todos = tids.split(',').filter((tid: string) => tid).map((tid: string) => this.todoMap.get(tid))
            if (usedTime > time) {
                if (tids) {
                    // 说明正在学习
                    wx.removeStorageSync('tid');
                    wx.removeStorageSync('startTime');
                    this.startRest();
                }
                const countup = Math.floor((usedTime - time) / 1000);
                this.setData({countup, countdown: 0, todos: []})
            } else {
                const countdown = Math.floor((time - usedTime) / 1000);
                this.setData({countdown, countup: 0, todos: todos})
            }
        }, 1000);
    },
    startStudy() {
        const now = Date.now();
        wx.setStorageSync('startTime', now);
        const todos: Todo[] = this.chooseTodo([]);
        const ids = todos.map(t => t.id).join(',')
        wx.setStorageSync('tids', ids);
        this.startTick();
    },
    chooseTodo(todos: Todo[]): Todo[] {
        if (!todos.length) {
            const todo: Todo = this.random(this.todoList);
            todos.push(todo);
        }
        console.log(todos)
        const todo = todos[todos.length - 1];
        if (!todo!.children.length) {
            return todos
        }
        const child = this.random(todo.children);
        todos.push(child);
        return this.chooseTodo(todos);
    },
    random(list: Todo[]): Todo {
        const index = Math.floor(Math.random() * list.length);
        return list[index];
    },
    startRest() {
        const now = Date.now();
        wx.setStorageSync('startTime', now);
        wx.removeStorageSync('tids');
        this.startTick();
    }
})
