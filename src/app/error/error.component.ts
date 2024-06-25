import { Component } from '@angular/core';
import { RouterLink ,RouterOutlet } from '@angular/router';


@Component({
  selector: 'app-error',
  standalone: true,
  imports: [RouterLink, RouterOutlet],
  templateUrl: './error.component.html',
  styleUrl: './error.component.less'
})
export class ErrorComponent {

}
