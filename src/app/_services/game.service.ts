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
    spies = this.generateRandomSpies(users, spyNumber);
    let game = new Game(roomId, users, owner, spyNumber, spies);
    let resolve = set(ref(this.db, 'games/' + game.id), {
      roomId: roomId.toString(),
      users: users,
      owner: owner,
      spyNumber: spyNumber,
      spies: spies,
      currentWord: '',
      round: 1
    }); 
    return resolve.then(() => {
      return game;
    }).catch((error) => {
      console.error(error);
    });
  }

  async updateCurrentWord(id: Guid, currentWord: string) {
    let game = await this.get(id);
    game.currentWord = currentWord;
    return set(ref(this.db, 'games/' + id), game).then(() => {
      return game;
    }).catch((error) => {
      console.error(error);
    });
  }

  async updateSpies(id: Guid, spies: string[]) {
    let game = await this.get(id);
    game.spies = spies;
    return set(ref(this.db, 'games/' + id), game).then(() => {
      return game;
    }).catch((error) => {
      console.error(error);
    });
  } 

  generateRandomSpies(users: string[], spyNumber: number) {
    let spies: string[] = [];
    let i = 0;
    while(i < spyNumber) {
      let randomUser = users[Math.floor(Math.random() * users.length)];
      if(!spies.includes(randomUser)) {
        spies.push(randomUser);
        i++;
      }
    }
    return spies;
  }

  async deleteUser(id: Guid, username: string) {
    let game = await this.get(id);
    let users = game.users;
    let index = users.indexOf(username);
    if(index > -1) {
      users.splice(index, 1);
    }
    game.users = users;
    return set(ref(this.db, 'games/' + id), game).then(() => {
      return game;
    }).catch((error) => {
      console.error(error);
    });
  }

  get(id: Guid): Promise<any> {
    return get(child(ref(this.db), 'games/' + id)).then((snapshot) => {
      if (snapshot.exists()) {
        return snapshot.val();
      } else {
        return null;
      }
    }).catch(error => {
      console.error(error);
      return null;
    }
    );
  }

  async updateRound(id: Guid, round: number) {
    let game = await this.get(id);
    game.round = round;
    return set(ref(this.db, 'games/' + id), game).then(() => {
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
    return set(ref(this.db, 'games/' + id), null).then(() => {
      return true;
    }).catch((error) => {
      console.error(error);
    });
  }
}
