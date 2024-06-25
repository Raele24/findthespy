import { Injectable } from '@angular/core';
import { Auth, signInAnonymously } from '@angular/fire/auth';
import { retry } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(
    private auth: Auth
  ) { }

  async login() {
    try {
      const userCredential = await signInAnonymously(this.auth);
      const user = userCredential.user;
      return user;
    } catch (error) {
      return null;
    }
  }

  isLogged() {
    return this.auth.currentUser;
  }


}
