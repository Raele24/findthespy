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

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ToolbarModule, AvatarModule, DialogModule, ButtonModule, OrderListModule,ToastModule, FormsModule, CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.less'
})
export class HomeComponent implements OnInit {
  loginVisible: boolean = false;
  createRoomVisible: boolean = false;
  username: string = '';
  rooms: Room[] = [];

  //create room
  roomName: string = '';
  roomPassword: string = '';
  roomMaxUsers: number = 4;



  constructor(private userService: UserService, private roomService: RoomService, private messageService: MessageService) { }

  async ngOnInit() {

    await this.refreshRooms();

    setTimeout(() => { const elements = document.getElementsByClassName('p-orderlist-controls');
      while(elements.length > 0){
        elements[0].parentNode!.removeChild(elements[0]);
      } }, 0.1);
    
  }

  joinRoom(room: Room){
    console.log(room);
  }

  async login(mode: string = '') {
    let res;
    if(mode === 'google') res = await this.userService.loginGoogle();
    else res = await this.userService.login();
    if(mode === 'google' && res) this.username = res.displayName!;
    localStorage.setItem('username', this.username);
    this.closeLoginDialog();
    this.showCreateRoomDialog();
  }

  async createRoom(){ 
    if(this.roomName === '') return this.messageService.add({severity:'error', summary:'Error', detail:'Room name is required!'});
    if(this.roomPassword === '') return this.messageService.add({severity:'error', summary:'Error', detail:'Room password is required!'});
    if(this.roomMaxUsers === 0) return this.messageService.add({severity:'error', summary:'Error', detail:'Room max users is required!'});
    if(localStorage.getItem('username') === null){
      this.messageService.add({severity:'waring', summary:'Warning', detail:'You must be logged in to create a room!'});
      this.closeCreateRoomDialog();
      this.showLoginDialog();
    } 
    let room = await this.roomService.create(this.roomName, this.roomPassword, this.roomMaxUsers, [localStorage.getItem('username')!], localStorage.getItem('username')!);
    this.messageService.add({severity:'success', summary:'Success', detail:'Room created successfully!'});
    this.closeCreateRoomDialog();
    await this.refreshRooms();
  }

  showLoginDialog(){
    this.loginVisible = true;
  }

  showCreateRoomDialog(){
    this.createRoomVisible = true;
  }

  closeLoginDialog(){
    this.loginVisible = false;
  }

  closeCreateRoomDialog(){
    this.createRoomVisible = false;
  }

  async refreshRooms(){
    let roomsJson = await this.roomService.getAll();  
    if(roomsJson) 
      this.rooms = Object.keys(roomsJson).map(key => roomsJson[key]);
    }
}
