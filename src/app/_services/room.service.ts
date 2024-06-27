import { Injectable } from '@angular/core';
import { Room } from '../_models/Room';
import {Md5} from 'ts-md5';
import { Database, set, ref, get, onValue, child, query, limitToLast } from '@angular/fire/database';

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

  async getAll(){
    return get(query(ref(this.db, 'rooms'), limitToLast(100))).then((snapshot) => {
      if (snapshot.exists()) {
        return snapshot.val();
      } else {
        return null;
      }
    }).catch((error) => {
      console.error(error);
    });
  }

  async get(id: string) {
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
}
