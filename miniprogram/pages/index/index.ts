// index.ts
import {Client} from "../../core/client";
import {Todo} from "../../models/todo";
import {UiService} from "../../core/ui.service";

const client = new Client();
const ui = new UiService();

Page({
    data: {
        todoList: [] as any,
        todos: [] as any,
        countup: 0,
        todoTime: 30 * 60 * 1000,
        restTime: 30 * 60 * 1000,
        token: ''
    },
    ticker: 0,
    todoMap: new Map(),
    todoList: [] as any,
    ringFlag: true,
    onLoad() {
        const restTime = wx.getStorageSync('restTime') || 30;
        this.setData({restTime: restTime * 60 * 1000})
    },
    onShow() {
        this.setData({
            token: wx.getStorageSync('token')
        })
        this.getTodoList().then(() => {
            const startTime = wx.getStorageSync('startTime');
            if (startTime) {
                this.startTick();
                this.setTodos();
            }
        });
    },
    async setting() {
        const oldTime = wx.getStorageSync('restTime') || 30;
        const [restTime] = await ui.input('请输入休息时长', [{type: 'text', value: oldTime}]);
        if (restTime) {
            wx.setStorageSync('restTime', restTime)
            this.setData({restTime: restTime * 60 * 1000})
        }
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
    playDing() {
        const manager = wx.getBackgroundAudioManager();
        manager.title = 'ding';
        manager.src = 'https://ticker-app.oss-cn-beijing.aliyuncs.com/ding.wav'
        manager.onCanplay(() => {
            manager.play();
        });
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
            this.setData({countup: usedTime});
            if (!this.data.todos.length) {
                if (usedTime > this.data.restTime && this.ringFlag) {
                    this.playDing();
                    this.ringFlag = false;
                }
            }
            if (this.data.todos.length) {
                if (usedTime > this.data.todoTime && this.ringFlag) {
                    this.playDing();
                    this.ringFlag = false;
                }
            }
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
        this.setData({countup: 0});
        this.startTick();
        this.ringFlag = true;
    },
    // 开始休息
    startRest() {
        const now = Date.now();
        wx.setStorageSync('startTime', now);
        wx.removeStorageSync('tids');
        this.setTodos();
        this.setData({countup: 0});
        this.startTick();
        this.ringFlag = true;
    },
    // 随机选择一个待办事项
    chooseTodo(todos: Todo[]): Todo[] {
        if (!todos.length) {
            const todo: Todo = this.random(this.todoList);
            todos.push(todo);
        }
        const todo = todos[todos.length - 1];
        if (!todo.enable) {
            // 如果是被禁用项目，就重新选择
            return this.chooseTodo([])
        }
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
        const todo = todos.pop();
        if (todo && todo.time) {
            this.setData({todoTime: todo.time * 60 * 1000})
        }
    },
    // 随机选取数组的其中一个
    random(list: Todo[]): Todo {
        const index = Math.floor(Math.random() * list.length);
        return list[index];
    }
})
