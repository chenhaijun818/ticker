export class Todo{
    id: string;
    pid: string;
    name: string;
    children = [];
    constructor(data: any) {
        this.id = data.id;
        this.name = data.name;
        this.pid = data.pid || '';
    }
}