// index.ts
import {Client} from "../../core/client";
import {Todo} from "../../models/todo";

const client = new Client();
Page({
    data: {
        todoList: [] as any,
        todo: null as any,
        countdown: 0,
        countup: 0
    },
    ticker: 0,
    todoMap: new Map(),
    todoList: [] as any,
    onLoad() {
        this.getTodoList().then(() => {
            let startTime = wx.getStorageSync('startTime');
            if (!startTime) {
                startTime = Date.now();
                wx.setStorageSync('startTime', startTime);
            }
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
            const time = 30 * 60 * 1000;
            const startTime = wx.getStorageSync('startTime');
            const now = Date.now();
            const usedTime = now - startTime;
            const tid = wx.getStorageSync('tid');
            const todo = this.todoMap.get(tid);
            if (usedTime > time) {
                if (todo) {
                    // 说明正在学习
                    wx.removeStorageSync('tid');
                    wx.removeStorageSync('startTime');
                    this.startRest();
                }
                const countup = Math.floor((usedTime - time) / 1000);
                this.setData({countup, countdown: 0, todo: null})
            } else {
                const countdown = Math.floor((time - usedTime) / 1000);
                this.setData({countdown, countup: 0, todo: todo})
            }
        }, 1000);
    },
    startStudy() {
        const now = Date.now();
        wx.setStorageSync('startTime', now);
        const todo: Todo = this.chooseTodo();
        wx.setStorageSync('tid', todo.id);
        this.startTick();
    },
    chooseTodo(todo?: Todo): Todo {
        if (!todo) {
            const index1 = this.random(this.todoList.length);
            todo = this.todoList[index1];
        }
        if (!todo!.children.length) {
            return todo as Todo;
        }
        const index2 = this.random(todo!.children.length);
        todo = todo!.children[index2];
        return this.chooseTodo(todo);
    },
    random(size: number) {
        return Math.floor(Math.random() * size)
    },
    startRest() {
        const now = Date.now();
        wx.setStorageSync('startTime', now);
        this.startTick();
    }
})
