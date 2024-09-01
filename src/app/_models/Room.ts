import { Guid } from "guid-typescript";

export class Room {
    id: Guid;
    name: string;
    password: string;
    maxUsers: number;
    users: string[];
    owner: string;
    status: string;
    createdAt: Date;
    gameId: string;
    constructor(name: string, password: string, maxUsers: number, users: string[], owner: string){
        this.id = Guid.create();
        this.name = name;
        this.password = password;
        this.maxUsers = maxUsers;
        this.users = users;
        this.owner = owner;
        this.status = 'OPEN';
        this.createdAt = new Date();
        this.gameId = '';
    }
}