import { Component, signal } from '@angular/core';
import { IbobQueryTabComponent } from "../../../components/inbound-outbound/ibob-query-tab/ibob-query-tab.component";

@Component({
  selector: 'app-in-out-query',
  imports: [IbobQueryTabComponent],
  templateUrl: './in-out-query.component.html',
  styleUrl: './in-out-query.component.scss'
})
export class InOutQueryComponent {
  isAdmin = signal(false)
}
