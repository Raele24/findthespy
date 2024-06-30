import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { RoomService } from '../_services/room.service';
import { ButtonModule } from 'primeng/button';
import { Guid } from 'guid-typescript';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-room',
  standalone: true,
  imports: [ButtonModule, CommonModule, ToastModule],
  templateUrl: './room.component.html',
  styleUrl: './room.component.less'
})
export class RoomComponent implements OnInit, OnDestroy {
  id: string = '';
  username: string = localStorage.getItem('username')!;
  room: any;

  constructor(private roomService: RoomService, private router: Router, private messageService: MessageService) { }

  async ngOnInit() {
    this.id = this.router.url.split('/')[2];
    let idGuid = Guid.parse(this.id);
    await this.roomService.get(idGuid).then((room) => {
      this.room = room;
      if(this.room === null) {
        this.router.navigate(['/']);
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

}
