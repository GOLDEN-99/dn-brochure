import { Component, inject, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DateInputComponent } from "../../../date-input/date-input.component";
import { OiBaseformService } from '../../../../service/other-income/oi-baseform.service';
import { SearchCompSubformComponent } from "../search-comp-subform/search-comp-subform.component";
import { EventSelectComponent } from "../event-select/event-select.component";

@Component({
  selector: 'app-other-income-baseform',
  imports: [FormsModule, DateInputComponent, SearchCompSubformComponent, EventSelectComponent],
  templateUrl: './other-income-baseform.component.html',
  styleUrl: './other-income-baseform.component.scss'
})
export class OtherIncomeBaseformComponent {
  private baseFormService = inject(OiBaseformService)
  state = this.baseFormService.baseformState
  private updator = this.baseFormService.updateOneField
  updateCompCode = this.updator('compCode')
  updateCompName = this.updator('compName')
  updateCompType = this.updator('compType')
  updateEvent = this.updator('eventId')
  updatePeriod = this.updator('period')
  updateStartDate = this.updator('startDate')
  updateEndDate = this.updator('endDate')
  mode = input<TFilter>('light')
}

type TFilter = 'light' | 'not-light' | 'all'