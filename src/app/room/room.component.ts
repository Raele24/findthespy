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

@Component({
  selector: 'app-room',
  standalone: true,
  imports: [ButtonModule, CommonModule, ToastModule, ConfirmDialogModule, DialogModule],
  templateUrl: './room.component.html',
  styleUrl: './room.component.less'
})
export class RoomComponent implements OnInit, OnDestroy{

  id: string = '';
  username: string = localStorage.getItem('username')!;
  room: any;
  visibleDeleteRoomDialog: boolean = false;

  constructor(private roomService: RoomService, private router: Router, private messageService: MessageService, private confirmationService: ConfirmationService) { }

  async ngOnInit() {
    this.id = this.router.url.split('/')[2];
    let idGuid = Guid.parse(this.id);
    if(this.username === null) {
      this.router.navigate(['/']);
    }
    this.roomService.getObservable(idGuid).subscribe(data => {
      this.room = data;
      if(this.room === null) {
        this.confirmDeleteRoom();
      }
    });
  }
  @HostListener('window:beforeunload')
   async ngOnDestroy() {
      if(this.room.owner === this.username) {
        this.deleteRoom();
      } else {
        this.leaveRoom();
      }
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

  closeDeleteRoomDialog() {
    this.visibleDeleteRoomDialog = false;
    this.router.navigate(['/']);
  }

  confirmDeleteRoom() {
    this.visibleDeleteRoomDialog = true;
  }

}
