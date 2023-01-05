// index.ts
import {Client} from "../../core/client";
import {Todo} from "../../models/todo";

const client = new Client();
Page({
    data: {
        todoList: [] as any
    },
    onLoad() {
        this.getTodoList();
    },
    getTodoList() {
        client.get('todoList').then((res: any) => {
            if (res && res.list) {
                const list: Todo[] = [];
                const todoList: any[] = [];
                const map: any = {};
                res.list.forEach((i: any) => {
                    const todo = new Todo(i);
                    list.push(todo);
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
                this.setData({todoList: this.data.todoList})
            }
        })
    },
    onColumnChange(e: any) {
        const {column, value} = e.detail;
        const todoList = this.data.todoList;
        const parent = todoList[column][value];
        todoList[column + 1] = parent.children;
        this.setData({todoList})
    },
    onChange(e: any) {
        const {value} = e.detail;
        console.log(value)
    }
})
