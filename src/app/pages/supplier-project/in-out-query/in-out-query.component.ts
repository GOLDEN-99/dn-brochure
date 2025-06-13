import { Component, inject, signal } from '@angular/core';
import { IbobQueryTabComponent } from "../../../components/inbound-outbound/ibob-query-tab/ibob-query-tab.component";
import { DateInputComponent } from "../../../components/date-input/date-input.component";
import { NgbCalendar } from '@ng-bootstrap/ng-bootstrap';
import { CUSTOM_FIELD_SEARCH_TOKEN, IBOB_RESERVATION_SEARCH } from '../../../components/inbound-outbound/ibob-query-tab/ibob-query-tab-token';

@Component({
  selector: 'app-in-out-query',
  imports: [IbobQueryTabComponent, DateInputComponent],
  templateUrl: './in-out-query.component.html',
  styleUrl: './in-out-query.component.scss',
  providers: [
    {
      provide: CUSTOM_FIELD_SEARCH_TOKEN,
      useValue: IBOB_RESERVATION_SEARCH
    }
  ]
})
export class InOutQueryComponent {
  isAdmin = signal(true)
  private calendar = inject(NgbCalendar)
  private today = this.calendar.getToday()
  from = signal(this.today)
  to = signal(this.today)
}
