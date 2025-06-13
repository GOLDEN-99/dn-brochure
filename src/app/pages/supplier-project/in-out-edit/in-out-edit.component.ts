import { Component, effect, inject, OnInit } from '@angular/core';
import { FormsModule, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbTimepicker } from '@ng-bootstrap/ng-bootstrap';
import { DoorFormService } from '../../../service/ibob/door-form.service';
import { DoorMutationService } from '../../../service/ibob/door-mutation.service';
import { RouterLink } from '@angular/router';


@Component({
  selector: 'app-in-out-edit',
  imports: [NgbTimepicker, ReactiveFormsModule, FormsModule, RouterLink],
  templateUrl: './in-out-edit.component.html',
  styleUrl: './in-out-edit.component.scss'
})
export class InOutEditComponent implements OnInit {

  ngOnInit(): void {
    const head = this.doorMutServ.doorHead()
    if (!head) return
    this.headForm.patchValue({ ...head })

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
    this.doorMutServ.updateDoor({
      door: head,
      time
    }).subscribe({
      next: () => { console.log('update ok') },
      error: (err) => { console.error(err) }
    })
  }

  constructor() {
    const patchValueEff = effect(() => {
      //patch head
      const head = this.doorHead()
      if (!head) return
      this.headForm.patchValue({ ...head })

      //patch list 
      this.dayKey.forEach((day) => {
        const idx = this.doorFormServ.genIndex(day)
        const value = this.doorMutServ.timeMap().get(idx)
        if (value) {
          value.forEach(
            ({ id, doorId, form, to }, i) => {
              const f = this.nnfb.group({
                id: this.nnfb.control(id),
                doorId: this.nnfb.control(doorId),
                form: this.nnfb.control(form, [Validators.required]),
                to: this.nnfb.control(to, [Validators.required])
              })
              this.doorFormServ.slotEditForm.controls[day].push(f)
            })
        }
      })
    })
  }

  private nnfb = inject(NonNullableFormBuilder)

  private doorFormServ = inject(DoorFormService)
  private doorMutServ = inject(DoorMutationService)
  doorHead = this.doorMutServ.doorHead
  durationStep = this.doorFormServ.durationStep
  headForm = this.doorFormServ.headForm
  slotForm = this.doorFormServ.slotEditForm
  dayKey = this.doorFormServ.keys
  getDayOfWeek = this.doorFormServ.getThaiDay
  addForm = this.doorFormServ.addEditForm
  removeForm = this.doorFormServ.removeEditForm
  getDisable = this.doorFormServ.getDisableState

  submitForm = () => {
    const head = this.doorFormServ.getFormHead()
    const time = this.doorFormServ.getTimeListEdit()
    this.doorMutServ.updateDoor({
      door: head,
      time
    }).subscribe({
      next: () => { console.log('update ok') },
      error: (err) => { console.error(err) }
    })
  }

}
