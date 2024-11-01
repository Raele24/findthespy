import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GameService } from '../_services/game.service';
import { Game } from '../_models/Game';
import { Guid } from 'guid-typescript';
import { ConfirmationService, MessageService } from 'primeng/api';
import { RoomService } from '../_services/room.service';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { LoginModalComponent } from '../_modals/login-modal/login-modal.component';
import { SplitterModule } from 'primeng/splitter';
import { PanelModule } from 'primeng/panel';
import { generate, count } from "random-words";
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [ButtonModule, CommonModule, ToastModule, ConfirmDialogModule, DialogModule, LoginModalComponent, SplitterModule, PanelModule, CardModule],
  templateUrl: './game.component.html',
  styleUrl: './game.component.less'
})
export class GameComponent implements OnInit, OnDestroy {
  id: string = '';
  gameId: string = '';
  game: any;
  username: string = localStorage.getItem('username')!;
  errorMessage: string = '';
  visibleDeleteGameDialog: boolean = false;
  label: string = '';
  users: any[] = [];
  spies: any[] = [];
  spyNumber: number = 0;
  colorBackground: string = '';
  subHeader: string = '';
  isOwnerBool: boolean = false;
  loaded: boolean = false;
  currentRound = 1;
  header: string = 'Spyfall';

  constructor(private router: Router, private gameService: GameService, private roomService: RoomService, private messageService: MessageService, private confirmationService: ConfirmationService) { window.addEventListener('beforeunload', this.beforeUnloadHandler.bind(this)); }

  ngOnInit() {

    if(this.username === null || this.username === '' || this.username === undefined) {
      this.router.navigate(['/home']);
    }
    this.id = this.router.url.split('/')[2];
    this.gameId = this.router.url.split('/')[3];
    this.gameService.getObservable(Guid.parse(this.gameId)).subscribe(data => {
      this.checkGameAvailability(data);  
      this.loaded = true;
    });
    this.gameService.get(Guid.parse(this.gameId)).then(async data => {
      this.game = data;
      if(this.isOwner()){
        let word = generate();
        this.gameService.updateCurrentWord(Guid.parse(this.gameId), word as string).then(data => {
          this.game = data;
          this.generateLabel();
          this.loaded = true;
        });
      } else {
        this.gameService.get(Guid.parse(this.gameId)).then(data => {
          this.game = data;
          this.generateLabel();
          this.loaded = true;
        });
      }
    });
  }

  nextRound(){
    if(this.isOwner()) {
      //generate new spies
      let spies = this.gameService.generateRandomSpies(this.game.users, this.game.spyNumber);
      this.gameService.updateSpies(Guid.parse(this.gameId), spies).then(data => {
        this.game = data;
        let word = generate();
        this.gameService.updateCurrentWord(Guid.parse(this.gameId), word as string).then(data => {
          this.game = data;
          this.gameService.updateRound(Guid.parse(this.gameId), this.game.round + 1).then(data => {
            this.game = data;
            this.generateLabel();
          });
        });
      });  
    }
  }

  generateLabel() {
    if(this.currentRound != this.game.round) {
      this.currentRound = this.game.round;
      this.messageService.add({severity:'info', summary:'Round started', detail:'New round has started!'});
    }
    if(this.checkIfSpy()) {
      this.header = 'You are a spy!';
      this.subHeader = 'Round: ' + this.game.round;
      this.colorBackground = '#660000';
      this.label = 'Try to find the word before they found you!';
    } else {
      this.header = 'You are not a spy!';
      this.subHeader = 'Round: ' + this.game.round;
      this.colorBackground = '#006600';
      let word = this.game.currentWord as string;
      this.label = 'The word is: ' + word.toUpperCase() + '!';
    }
  }

  checkIfSpy() {
    if(this.game.spies.includes(this.username)) {
      return true;
    }
    return false
  }

  checkGameAvailability(data: any) {
    if(data === null) {
      this.errorMessage = 'Game ended';
      this.confirmDeleteGame();
    }
    else{
      if(data.users.length >= 3) {
        this.game = data;
        this.generateLabel(); 
      } else {
        this.errorMessage = 'Not enough players to keep playing';
        this.deleteRoomAndGame();
        this.confirmDeleteGame();
      }
    }
  }

  confirmDeleteGame() {
    this.visibleDeleteGameDialog = true;
  }

  @HostListener('window:beforeunload', ['$event'])
  beforeUnloadHandler(event: any) {
    if(this.isOwner()) {
      this.deleteRoomAndGame();
    } 
    event.returnValue = '';
  }

  isOwner() {
    if(this.game.owner === this.username) {
      this.isOwnerBool = true;
    } else{
      this.isOwnerBool = false;
    }
    return this.isOwnerBool;
  }

  ngOnDestroy() {
    window.removeEventListener('beforeunload', this.beforeUnloadHandler.bind(this));
  }

  closeRoom() {
    this.confirmationService.confirm({
      message: 'Are you sure you want to close the room?',
      accept: () => {
        this.deleteRoomAndGame();
      }
    });
  }

  async deleteRoomAndGame() {
    let idGuid = Guid.parse(this.gameId);
    await this.gameService.delete(idGuid);
    let roomId = Guid.parse(this.id);
    await this.roomService.delete(roomId);
    this.router.navigate(['/']);
  }

  quit(){
    this.confirmationService.confirm({
      message: 'Are you sure you want to quit the game?',
      accept: () => {
        this.deleteUser();
      }
    });
  }

  async deleteUser() {
    let idGuid = Guid.parse(this.gameId);
    await this.gameService.deleteUser(idGuid, this.username);
    await this.roomService.leave(Guid.parse(this.id), this.username);
    this.router.navigate(['/']);
  }

  closeDeleteGameDialog() {
    this.visibleDeleteGameDialog = false;
    this.router.navigate(['/']);
  }

}
