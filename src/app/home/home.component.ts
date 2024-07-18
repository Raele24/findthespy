import { Component, OnInit } from '@angular/core';
import { ToolbarModule } from 'primeng/toolbar';
import { AvatarModule } from 'primeng/avatar';
import { UserService } from '../_services/user.service';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { OrderListModule } from 'primeng/orderlist';
import { Room } from '../_models/Room';
import { CommonModule } from '@angular/common';
import { RoomService } from '../_services/room.service';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { RoomComponent } from '../room/room.component';

import { InputNumberModule } from 'primeng/inputnumber';
import { LoginModalComponent } from '../_modals/login-modal/login-modal.component';
import { Observable } from 'rxjs';
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ToolbarModule,
             AvatarModule,
            DialogModule, 
            ButtonModule, 
            OrderListModule,
            ToastModule, 
            ProgressSpinnerModule, 
            InputNumberModule, 
            FormsModule, 
            CommonModule, 
            RoomComponent,
            LoginModalComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.less'
})
export class HomeComponent implements OnInit {
  loginVisible: boolean = false;
  createRoomVisible: boolean = false;
  joinRoomVisible: boolean = false;
  username: string = '';
  rooms: Room[] = [];
  listLoading: boolean = true;

  //create room
  roomName: string = '';
  roomPassword: string = '';
  roomMaxUsers: number = 4;

  //join room
  tempRoom!: Room;
  joinRoomPassword: string = '';
  closedLogin: any;



  constructor(private userService: UserService, private roomService: RoomService, private messageService: MessageService, private router: Router) { }

  async ngOnInit() {

    const elements = document.getElementsByClassName('p-orderlist-controls');
    while(elements.length > 0){
      elements[0].parentNode!.removeChild(elements[0]);
    } 

    this.roomService.getAllObservable().subscribe(data => {
        this.listLoading = true;
        this.rooms = data;
        this.rooms = this.rooms.filter(room => room.owner !== localStorage.getItem('username'));
        this.rooms.sort((a, b) => {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        this.listLoading = false;
      });
  }

  joinRoom(){
    let room = this.tempRoom;
    if(localStorage.getItem('username') === null || localStorage.getItem('username') === '' || localStorage.getItem('username') === undefined){
      this.messageService.add({severity:'error', summary:'Warning', detail:'You must be logged in to join a room!'});
      this.showLoginDialog();
      return;
    } 
    if(room.users.length >= room.maxUsers) return this.messageService.add({severity:'error', summary:'Error', detail:'Room is full!'});
    if(this.roomService.checkPassword(room, this.joinRoomPassword) === false) return this.messageService.add({severity:'error', summary:'Error', detail:'Wrong password!'});
    this.router.navigate(['/room', room.id]);
  }

  async createRoom(){ 
    if(this.roomName === '') return this.messageService.add({severity:'error', summary:'Error', detail:'Room name is required!'});
    if(this.roomPassword === '') return this.messageService.add({severity:'error', summary:'Error', detail:'Room password is required!'});
    if(this.roomMaxUsers === 0) return this.messageService.add({severity:'error', summary:'Error', detail:'Room max users is required!'});
    if(localStorage.getItem('username') === null || localStorage.getItem('username') === '' || localStorage.getItem('username') === undefined){
      this.messageService.add({severity:'error', summary:'Warning', detail:'You must be logged in to create a room!'});
      this.showLoginDialog();
      return;
    } 
    let room = await this.roomService.create(this.roomName, this.roomPassword, this.roomMaxUsers, [localStorage.getItem('username')!], localStorage.getItem('username')!) as Room;
    if(room === null) return this.messageService.add({severity:'error', summary:'Error', detail:'Room name already exists!'});
    this.messageService.add({severity:'success', summary:'Success', detail:'Room created successfully!'});
    this.closeCreateRoomDialog();
    this.router.navigate(['/room', room.id.toString()]);
  }

  showLoginDialog(){
    this.loginVisible = true;
  }

  waitLoginClosed(event: boolean) {
    this.loginVisible = event;
  }

  showCreateRoomDialog(){
    this.createRoomVisible = true;
  }

  closeCreateRoomDialog(){
    this.createRoomVisible = false;
  }


  showJoinRoomDialog(room: Room){
    this.tempRoom = room;
    this.joinRoomVisible = true;
  }

  closeJoinRoomDialog(){
    this.joinRoomVisible = false;
  }
}
