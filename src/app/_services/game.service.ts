import { Injectable } from '@angular/core';
import { Database, set, ref, get, onValue, child, query, limitToLast} from '@angular/fire/database';
import { Game} from '../_models/Game';
import { Guid } from 'guid-typescript';
import { interval, Observable, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GameService {

  constructor(
    private db: Database
  )  { }

  async create(roomId: Guid, users: string[], owner: string, spyNumber: number) {
    let spies: string[] = [];
    let i = 0;
    while(i < spyNumber) {
      let randomUser = users[Math.floor(Math.random() * users.length)];
      if(!spies.includes(randomUser)) {
        spies.push(randomUser);
        i++;
      }
    }
    let game = new Game(roomId, users, owner, spyNumber, spies);
    let resolve = set(ref(this.db, 'games/' + game.id), {
      roomId: roomId.toString(),
      users: users,
      owner: owner,
      spyNumber: spyNumber,
      spies: spies,
    }); 
    return resolve.then(() => {
      return game;
    }).catch((error) => {
      console.error(error);
    });

  }

  getObservable(id: Guid): Observable<any> {
    return interval(1000).pipe(
      switchMap(() => get(child(ref(this.db), 'games/' + id)).then((snapshot) => {
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

  async delete(id: Guid) {
    console.log(id);
    return set(ref(this.db, 'games/' + id), null).then(() => {
      return true;
    }).catch((error) => {
      console.error(error);
    });
  }
}
