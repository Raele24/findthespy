import { Component, EventEmitter, Input, Output } from '@angular/core';
import { UserService } from '../../_services/user.service';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-login-modal',
  standalone: true,
  imports: [DialogModule, ButtonModule, FormsModule],
  templateUrl: './login-modal.component.html',
  styleUrl: './login-modal.component.less'
})
export class LoginModalComponent {
  @Input() loginDialogVisible!: boolean;
  @Output() loginDialogVisibleChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  username: string = '';


  constructor(private userService: UserService) { }

  ngOnInit() {
  }

  async login(mode: string = '') {
    let res;
    if(mode === 'google') res = await this.userService.loginGoogle();
    else res = await this.userService.login();
    if(mode === 'google' && res) this.username = res.displayName!;
    localStorage.setItem('username', this.username);
    return this.closeLoginDialog();
  }

  closeLoginDialog() {
    this.loginDialogVisible = false;
    this.loginDialogVisibleChange.emit(this.loginDialogVisible);
  }

}
