import { Injectable } from '@angular/core';
import { Auth, signInAnonymously, signInWithPopup, GoogleAuthProvider } from '@angular/fire/auth';


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

  async loginGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(this.auth, provider);
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
