import { Component, OnInit } from '@angular/core';
import { ToolbarModule } from 'primeng/toolbar';
import { AvatarModule } from 'primeng/avatar';
import { UserService } from '../_services/user.service';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ToolbarModule, AvatarModule, DialogModule, ButtonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.less'
})
export class HomeComponent implements OnInit {
  visible: boolean = false;

  constructor(private userService: UserService) { }

  async ngOnInit() {
    let res = await this.userService.login();
    console.log(res);
  }

  showDialog(){
    this.visible = true;
  }

  closeDialog(){
    this.visible = false;
  }

}
