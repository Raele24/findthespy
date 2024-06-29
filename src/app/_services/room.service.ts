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
    password = Md5.hashStr(password).toString();
    const room = new Room(name, password, maxUsers, users, owner);
    console.log(room);
    let resolve = set(ref(this.db, 'rooms/' + room.id), {
      name: name,
      password: password,
      maxUsers: maxUsers,
      users: users,
      owner: owner,
      status: 'OPEN',
      createdAt: room.createdAt.toUTCString()
    });
    return resolve.then(() => {
      return room;
    }).catch((error) => {
      console.error(error);
    });
  }

  getAll(): Observable<any[]> {
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

  async update(id: Guid, room: Room) {
    return set(ref(this.db, 'rooms/' + id), {
      name: room.name,
      password: room.password,
      maxUsers: room.maxUsers,
      users: room.users,
      owner: room.owner,
      status: room.status,
      createdAt: room.createdAt
    }).then(() => {
      return room;
    }).catch((error) => {
      console.error(error);
    });
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

}
