import { Component, inject, OnInit, signal } from '@angular/core';
import { FormArray, FormGroup, FormsModule, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbTimepicker, NgbTimeStruct } from '@ng-bootstrap/ng-bootstrap';
import { RouterLink } from '@angular/router';
import { TMapForm } from '../../../../../types';
import { DoorService } from '../../../../../service/ibob/door.service';
import { TCreateTimeSlot } from '../../../../../types/ibob-supplier.type';
import { filter, tap } from 'rxjs';
import { DoorFormService } from '../../../../../service/ibob/door-form-edit.service';
import { DoorMutationService } from '../../../../../service/ibob/door-mutation.service';

@Component({
  selector: 'app-add-schedule-form',
  imports: [FormsModule, ReactiveFormsModule, NgbTimepicker, RouterLink],
  templateUrl: './add-schedule-form.component.html',
  styleUrl: './add-schedule-form.component.scss'
})
export class AddScheduleFormComponent implements OnInit {

  ngOnInit(): void { }

  private doorFormServ = inject(DoorFormService)
  private doorMutServ = inject(DoorMutationService)

  durationStep = this.doorFormServ.durationStep
  headForm = this.doorFormServ.headForm
  slotForm = this.doorFormServ.slotForm
  dayKey = this.doorFormServ.keys
  getDayOfWeek = this.doorFormServ.getThaiDay
  addForm = this.doorFormServ.addForm
  removeForm = this.doorFormServ.removeForm
  getDisable = this.doorFormServ.getDisableState

  submitForm = () => {
    const head = this.doorFormServ.getFormHead()
    const time = this.doorFormServ.getTimeList()
    this.doorMutServ.createDoor({
      door: head,
      time
    }).subscribe({
      next: () => { console.log('ok') },
      error: (err) => { console.error(err) }
    })
  }

  private doorServ = inject(DoorService)

  private genIndex = (k: TFormKey) => {
    switch (k) {
      case 'sun': return 7
      case 'mon': return 1
      case 'tue': return 2
      case 'wed': return 3
      case 'thu': return 4
      case 'fri': return 5
      case 'sat': return 6
    }
  }

  private formatTime = (t: NgbTimeStruct) => {
    const { hour, minute } = t
    return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
  }

  private prepareArray = (d: TDayDetail) => ({ form, to }: TDuration): TCreateTimeSlot => ({
    startTime: this.formatTime(form),
    endTime: this.formatTime(to),
    ...d,
    isAvailable: true
  })

  private preparedArrWithDay = (d: TFormKey) => {
    const dayId = this.genIndex(d)
    const dayName = this.getThaiDay(d)
    return this.prepareArray({ dayId, dayName })
  }

  submitForm = () => {
    const { mail, multiple, doorname, note, intendant, timeUse } = this.headForm.getRawValue()
    const formmatedHead = { doorname, timeUse, note, intendant, mail, multiple: multiple ? "1" : "0" }
    const rawList = this.form.getRawValue()
    const keyList = Object.keys(rawList) as TFormKey[]

    const formattedList = keyList.flatMap((d) => {
      const partialFn = this.preparedArrWithDay(d)
      return rawList[d].map(partialFn)
    })
  }

}

type TDayDetail = {
  dayId: number
  dayName: string
}
