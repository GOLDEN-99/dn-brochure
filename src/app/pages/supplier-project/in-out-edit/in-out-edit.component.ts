import { Component, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { NgbTimepicker } from '@ng-bootstrap/ng-bootstrap';
import { DoorFormService } from '../../../service/ibob/door-form.service';
import { DoorMutationService } from '../../../service/ibob/door-mutation.service';


@Component({
  selector: 'app-in-out-edit',
  imports: [NgbTimepicker, ReactiveFormsModule],
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

}
