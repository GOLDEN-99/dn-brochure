import { Component } from '@angular/core';
import { ProchureCardComponent } from "../prochure-card/prochure-card.component";

@Component({
  selector: 'app-prochure',
  standalone: true,
  imports: [ProchureCardComponent],
  templateUrl: './prochure.component.html',
  styleUrl: './prochure.component.scss'
})
export class ProchureComponent {
  items = [...Array(6)].map((_, i) => i)
}
