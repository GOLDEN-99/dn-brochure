import { DatePipe } from '@angular/common';
import { Component, inject, input, output, viewChild } from '@angular/core';
import { TCompType } from '../../../../types';
import { NgbCalendar, NgbDate, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { OiBaseformService, TApiBaseformInsert } from '../../../../service/other-income/oi-baseform.service';
import { EventSelectComponent } from "../../form/event-select/event-select.component";
import { FormsModule } from '@angular/forms';
import { DateInputComponent } from "../../../date-input/date-input.component";
import { SearchCompSubformComponent } from "../../form/search-comp-subform/search-comp-subform.component";

@Component({
  selector: 'app-other-income-head-edit',
  imports: [DatePipe, EventSelectComponent, FormsModule, DateInputComponent, SearchCompSubformComponent],
  templateUrl: './other-income-head-edit.component.html',
  styleUrl: './other-income-head-edit.component.scss'
})
export class OtherIncomeHeadEditComponent {
  canEdit = input(false)
  head = input.required<TEditHeadProps>()
  comp = input.required<TCompProps>()
  income = input.required<TIncomeProps>()
  event = input.required<TEventProps>()
  submit = output<TApiBaseformInsert>()
  mode = input<TFilter>('all')
  private calService = inject(NgbCalendar)
  private today = this.calService.getToday()
  private headForm = inject(OiBaseformService)
  state = this.headForm.baseformState
  private baseUpdate = this.headForm.updateOneField
  updateEvent = this.baseUpdate('eventId')
  updatePeriod = this.baseUpdate('period')
  updateStartDate = this.baseUpdate('startDate')
  updateEndDate = this.baseUpdate('endDate')
  updateCompType = this.baseUpdate('compType')
  updateCompName = this.baseUpdate('compName')
  updateCompCode = this.baseUpdate('compCode')

  private modalService = inject(NgbModal)
  private modal = viewChild('headModal')
  openModal() {
    this.state.update(prev => {
      const { startDate, endDate, period, } = this.head()
      const { compCode, compName, compType } = this.comp()
      const validComp = compType as TCompType
      const { id: eventId } = this.event()
      const formatStart = this.convertToNgb(startDate)
      const formateEnd = this.convertToNgb(endDate)
      return { ...prev, eventId, compCode, compName, period, startDate: formatStart, endDate: formateEnd, compType: validComp }
    })
    this.modalService.open(this.modal())
  }

  closeModal() {
    this.headForm.resetForm()
    this.modalService.dismissAll()
  }

  submitForm() {
    this.submit.emit(this.headForm.request);
    this.modalService.dismissAll();
  }

  private convertToNgb(iso: string) {
    try {
      const [yyyy, mm, dd] = iso.split('T')[0].split('-').map(Number)
      const temp = new NgbDate(yyyy, mm, dd)
      return temp
    } catch (err) {
      return this.today
    }
  }
}

type TEditHeadProps = {
  id: number,
  period: number,
  startDate: string,
  endDate: string,
  displayName: string,
}

type TCompProps = {
  compCode: string
  compName: string
  compType: string
}
type TIncomeProps = {
  id: number
  incomeName: string
  incomeType: number
}

type TEventProps = {
  id: number
  eventName: string
  eventType: number
}

type TFilter = 'light' | 'not-light' | 'all'