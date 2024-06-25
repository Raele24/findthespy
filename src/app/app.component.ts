import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UserService } from './_services/user.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, FormsModule], 
  templateUrl: './app.component.html',
  styleUrl: './app.component.less'
})
export class AppComponent implements OnInit {
  title = 'findthespy';

  constructor(private router: Router, private userService: UserService) { }

  ngOnInit(): void {
    if(!this.userService.isLogged()) {
    //  this.router.navigate(['/login']);
    }
  }
  
}
