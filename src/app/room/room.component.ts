import { Component, HostListener, Input, OnDestroy, OnInit } from '@angular/core';
import { RoomService } from '../_services/room.service';
import { ButtonModule } from 'primeng/button';
import { Guid } from 'guid-typescript';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { LoginModalComponent } from '../_modals/login-modal/login-modal.component';
import { SplitterModule } from 'primeng/splitter';
import { PanelModule } from 'primeng/panel';

@Component({
  selector: 'app-room',
  standalone: true,
  imports: [ButtonModule, CommonModule, ToastModule, ConfirmDialogModule, DialogModule, LoginModalComponent, SplitterModule, PanelModule],
  templateUrl: './room.component.html',
  styleUrl: './room.component.less'
})
export class RoomComponent implements OnInit, OnDestroy{
  loginVisible: boolean = false;
  id: string = '';
  username: string = localStorage.getItem('username')!;
  room: any;
  visibleDeleteRoomDialog: boolean = false;
  deletingRoomDialog: boolean = false;
  leavingRoomDialog: boolean = false;
  errorMessage: string = '';

  users: string[] = [];

  constructor(private roomService: RoomService, private router: Router, private messageService: MessageService, private confirmationService: ConfirmationService) { window.addEventListener('beforeunload', this.beforeUnloadHandler.bind(this)); }

  async ngOnInit() {
    this.id = this.router.url.split('/')[2];
    let idGuid = Guid.parse(this.id);
    this.room = await this.roomService.get(idGuid);
    this.checkRoomAvailability();
    this.updateRoomInfo();
    if(!this.isOwner()) {
      if(this.username === null || this.username === '' || this.username === undefined) {
        this.showLoginDialog();
      } else {
        this.room.users.push(localStorage.getItem('username')!);
        if(!await this.roomService.update(idGuid, this.room)){
          this.errorMessage = 'Lobby is full or user already in lobby';
          this.room = null;
          this.confirmDeleteRoom();
          return;
        }
      }
    }
    this.roomService.getObservable(idGuid).subscribe(data => {
      this.room = data;
      this.checkRoomAvailability();
      this.updateRoomInfo();
    });
  }

  isOwner() {
    return this.room.owner === this.username;
  }

  isOwnerFromUsername(username: string) {
    return this.room.owner === username;
  }

  updateRoomInfo()
  {
    this.users = this.room.users;
  }  

  checkRoomAvailability() {
    if(this.room === null) {
      this.errorMessage = 'Room is deleted';
      this.confirmDeleteRoom();
    }
  }


  @HostListener('window:beforeunload', ['$event'])
  beforeUnloadHandler(event: any) {
    if(this.isOwner()) {
      this.deleteRoom();
    } else {
      this.leaveRoom();
    }
    event.returnValue = '';
  }

    ngOnDestroy() {
      window.removeEventListener('beforeunload', this.beforeUnloadHandler.bind(this));
    }

  async leaveRoom() {
    let idGuid = Guid.parse(this.id);
    await this.roomService.leave(idGuid, localStorage.getItem('username')!);
    this.router.navigate(['/']);
  }

  async deleteRoom() {
    let idGuid = Guid.parse(this.id);
    await this.roomService.delete(idGuid);
    this.router.navigate(['/']);
  }

  openDeletingRoomDialog() {
    this.deletingRoomDialog = true;
  }

  openLeavingRoomDialog() {
    this.leavingRoomDialog = true;
  }

  closeDeletingRoomDialog() {
    this.deletingRoomDialog = false;
  }

  closeDeleteRoomDialog() {
    this.visibleDeleteRoomDialog = false;
    this.router.navigate(['/']);
  }

  closeLeavingRoomDialog() {
    this.leavingRoomDialog = false;
  }

  confirmDeleteRoom() {
    this.visibleDeleteRoomDialog = true;
  }

  showLoginDialog() {
    this.loginVisible = true;
  }

  waitLoginClosed(event: boolean) {
    this.loginVisible = event;
    window.location.reload()
  }

  startGame() {
    if(this.room.users.length < 3) {
      this.messageService.add({severity:'error', summary:'Error', detail:'Not enough players to start game'});
      return;
    }
  }

}
