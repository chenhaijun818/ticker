export class Todo{
    id: string;
    pid: string;
    name: string;
    time: number;
    enable: boolean;
    children = [];
    constructor(data: any) {
        this.id = data._id;
        this.name = data.name;
        this.time = data.time;
        this.enable = data.enable;
        this.pid = data.pid || '';
    }
}