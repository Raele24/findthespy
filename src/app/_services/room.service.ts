import { Injectable } from '@angular/core';
import { Room } from '../_models/Room';
import {Md5} from 'ts-md5';
import { Database, set, ref, get, onValue, child, query, limitToLast } from '@angular/fire/database';
import { Guid } from 'guid-typescript';
import { Observable, interval, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RoomService {

  constructor(
    private db: Database
  )  { }

  async create(name: string, password: string, maxUsers: number, users: string[], owner: string) {
    let rooms = await this.getAll();
    if(rooms!.find(r => r.name === name)) return null;
    password = Md5.hashStr(password).toString();
    const room = new Room(name, password, maxUsers, users, owner);
    let resolve = set(ref(this.db, 'rooms/' + room.id), {
      name: name,
      password: password,
      maxUsers: maxUsers,
      users: users,
      owner: owner,
      status: 'OPEN',
      createdAt: room.createdAt.toUTCString(),
      gameId: ''
    });
    return resolve.then(() => {
      return room;
    }).catch((error) => {
      console.error(error);
    });
  }

  async getAll() {
    return get(query(ref(this.db, 'rooms'))).then((snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        return Object.keys(data).map(k => ({ id: k, ...data[k] }));
      } else {
        return [];
      }
    }).catch((error) => {
      console.error(error);
    });
  }

  getAllObservable(): Observable<any[]> {
    return interval(1000).pipe(
      switchMap(() => get(query(ref(this.db, 'rooms'), limitToLast(100))).then((snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          return Object.keys(data).map(k => ({ id: k, ...data[k] }));
        } else {
          return [];
        }
      }).catch(error => {
        console.error(error);
        return [];
      })));
  }

  async get(id: Guid) {
    return get(child(ref(this.db), 'rooms/' + id)).then((snapshot) => {
      if (snapshot.exists()) {
        return snapshot.val();
      } else {
        return null;
      }
    }).catch((error) => {
      console.error(error);
    });
  }

  getObservable(id: Guid): Observable<any> {
    return interval(1000).pipe(
      switchMap(() => get(child(ref(this.db), 'rooms/' + id)).then((snapshot) => {
        if (snapshot.exists()) {
          return snapshot.val();
        } else {
          return null;
        }
      }).catch(error => {
        console.error(error);
        return null;
      })));
  }

  async update(id: Guid, room: Room): Promise<boolean> {
    let currentRoom = await this.get(id); 
    if(currentRoom === null) return false;
    if(!this.checkRoomSettingsBeforeUpdate(currentRoom, room)){
      return false;
    }
    return set(ref(this.db, 'rooms/' + id), {
      name: room.name,
      password: room.password,
      maxUsers: room.maxUsers,
      users: room.users,
      owner: room.owner,
      status: room.status,
      createdAt: room.createdAt,
      gameId: room.gameId
    }).then(() => {
      return true;
    }).catch((error) => {
      return false;
    });
  }

  checkRoomSettingsBeforeUpdate(currentRoom: Room, room: Room): boolean {
    if(room.users.length > room.maxUsers) {
      return false;
    }
    if(room.users.length !== new Set(room.users).size) {
      return false;
    }
    if(currentRoom.owner !== room.owner) {
      return false;
    }
    if(currentRoom.status !== "OPEN" && currentRoom.status !== "IN-GAME") {
      return false;
    }
    return true;
  }

  async leave(id: Guid, username: string) {
    let room = await this.get(id);
    if(room === null) return;
    room.users = room.users.filter((u: string) => u !== username);
    return this.update(id, room);
  }

  async delete(id: Guid) {
    return set(ref(this.db, 'rooms/' + id), null).then(() => {
      return true;
    }).catch((error) => {
      console.error(error);
    });
  }

  checkPassword(room: Room, password: string) {
    return room.password === Md5.hashStr(password).toString();
  }

  async setStatus(id: Guid, status: string) {
    let room = await this.get(id);
    if(room === null) return;
    room.status = status;
    return this.update(id, room);
  }

  async setGameId(id: Guid, gameId: string) {
    let room = await this.get(id);
    if(room === null) return;
    room.gameId = gameId;
    return this.update(id, room);
  }

}
