import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbTimepicker } from '@ng-bootstrap/ng-bootstrap';
import { RouterLink } from '@angular/router';
import { DoorMutationService } from '../../../../../service/ibob/door-mutation.service';
import { DoorFormCreateService } from '../../../../../service/ibob/door-form-create.service';

@Component({
  selector: 'app-add-schedule-form',
  imports: [FormsModule, ReactiveFormsModule, NgbTimepicker, RouterLink],
  templateUrl: './add-schedule-form.component.html',
  styleUrl: './add-schedule-form.component.scss'
})
export class AddScheduleFormComponent implements OnInit {
  ngOnInit(): void {

  }

  private doorFormServ = inject(DoorFormCreateService)
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
    const req = this.doorFormServ.request

    this.doorMutServ.createDoor(req).subscribe({
      next: () => { console.log('ok') },
      error: (err) => { console.error(err) }
    })
  }

}
