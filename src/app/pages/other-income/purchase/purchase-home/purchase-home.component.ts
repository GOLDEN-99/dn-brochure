import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-purchase-home',
  imports: [RouterLink],
  templateUrl: './purchase-home.component.html',
  styleUrl: './purchase-home.component.scss'
})
export class PurchaseHomeComponent {
  data = signal<any[]>([])
}
