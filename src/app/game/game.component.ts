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

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [ButtonModule, CommonModule, ToastModule, ConfirmDialogModule, DialogModule, LoginModalComponent, SplitterModule, PanelModule],
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

  constructor(private router: Router, private gameService: GameService, private roomService: RoomService, private messageService: MessageService, private confirmationService: ConfirmationService) { window.addEventListener('beforeunload', this.beforeUnloadHandler.bind(this)); }

  ngOnInit() {

    if(this.username === null || this.username === '' || this.username === undefined) {
      this.router.navigate(['/home']);
    }
    this.id = this.router.url.split('/')[2];
    this.gameId = this.router.url.split('/')[3];
    this.gameService.getObservable(Guid.parse(this.gameId)).subscribe(data => {
      this.game = data;
      this.checkGameAvailability();
    });
  }

  checkGameAvailability() {
    if(this.game === null) {
      this.errorMessage = 'Game ended';
      this.confirmDeleteGame();
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
    return this.game.owner === this.username;
  }

  ngOnDestroy() {
    window.removeEventListener('beforeunload', this.beforeUnloadHandler.bind(this));
  }

  async deleteRoomAndGame() {
    let idGuid = Guid.parse(this.gameId);
    await this.gameService.delete(idGuid);
    let roomId = Guid.parse(this.id);
    await this.roomService.delete(roomId);
    this.router.navigate(['/']);
  }

  closeDeleteGameDialog() {
    this.visibleDeleteGameDialog = false;
    this.router.navigate(['/']);
  }

}
