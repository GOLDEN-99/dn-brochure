import { Component } from '@angular/core';
import { ProchureComponent } from "../../components/prochure/prochure.component";

@Component({
  selector: 'app-prochure-page',
  standalone: true,
  imports: [ProchureComponent],
  templateUrl: './prochure-page.component.html',
  styleUrl: './prochure-page.component.scss'
})
export class ProchurePageComponent {

}
