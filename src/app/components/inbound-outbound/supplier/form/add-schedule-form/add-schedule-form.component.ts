import { Component, inject, OnInit, signal } from '@angular/core';
import { FormArray, FormGroup, FormsModule, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbTimepicker, NgbTimeStruct } from '@ng-bootstrap/ng-bootstrap';
import { RouterLink } from '@angular/router';
import { TMapForm } from '../../../../../types';
import { DoorService } from '../../../../../service/ibob/door.service';
import { TCreateTimeSlot } from '../../../../../types/ibob-supplier.type';

import { filter, tap } from 'rxjs';
import { DoorFormService } from '../../../../../service/ibob/door-form.service';
import { DoorMutationService } from '../../../../../service/ibob/door-mutation.service';

@Component({
  selector: 'app-add-schedule-form',
  imports: [FormsModule, ReactiveFormsModule, NgbTimepicker, RouterLink],
  templateUrl: './add-schedule-form.component.html',
  styleUrl: './add-schedule-form.component.scss'
})
export class AddScheduleFormComponent implements OnInit {

  ngOnInit(): void {

  }

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

}
