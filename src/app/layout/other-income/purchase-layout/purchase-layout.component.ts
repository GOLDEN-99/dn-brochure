import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-purchase-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './purchase-layout.component.html',
  styleUrl: './purchase-layout.component.scss'
})
export class PurchaseLayoutComponent {

}
