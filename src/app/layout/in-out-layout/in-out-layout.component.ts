import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-in-out-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './in-out-layout.component.html',
  styleUrl: './in-out-layout.component.scss'
})
export class InOutLayoutComponent {

}
