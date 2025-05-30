import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { DoorFormService } from '../../../service/ibob/door-form.service';
import { DoorMutationService } from '../../../service/ibob/door-mutation.service';
import { NgbTimepickerModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-in-out-add',
  imports: [ReactiveFormsModule, NgbTimepickerModule],
  templateUrl: './in-out-add.component.html',
  styleUrl: './in-out-add.component.scss'
})
export class InOutAddComponent {
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
