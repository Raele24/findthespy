import { Guid } from "guid-typescript";

export class Game {
    id: Guid;
    roomId: Guid;
    users: string[];
    spyNumber: number;
    owner: string;
    currentWord: string;
    spies: string[];
    round: number;
    public constructor(roomId: Guid, users: string[], owner: string, spyNumber: number, spies: string[]) {
        this.id = Guid.create();
        this.roomId = roomId;
        this.users = users;
        this.owner = owner;
        this.spyNumber = spyNumber;
        this.spies = spies;
        this.currentWord = '';
        this.round = 1;
    }
}