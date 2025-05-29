import { Component, inject } from '@angular/core';
import { DoorService } from '../../../service/ibob/door.service';
import { DoorMutationService } from '../../../service/ibob/door-mutation.service';
<<<<<<< HEAD
import { FormsModule } from '@angular/forms';
import { DoorFormService, TFormKey } from '../../../service/ibob/door-form.service';
import { NgbTimepicker } from '@ng-bootstrap/ng-bootstrap';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-in-out-detail',
  imports: [FormsModule, NgbTimepicker, RouterLink],
=======

@Component({
  selector: 'app-in-out-detail',
  imports: [],
>>>>>>> 7b473f5093996e06fd3458a742f1a4cedbd08bb4
  templateUrl: './in-out-detail.component.html',
  styleUrl: './in-out-detail.component.scss'
})
export class InOutDetailComponent {
  private doorMutServ = inject(DoorMutationService)
<<<<<<< HEAD
  private doorFormServ = inject(DoorFormService)
  id = this.doorMutServ.doorId
  doorInfo = this.doorMutServ.doorHead
  timeMap = this.doorMutServ.timeMap
  dayKey = this.doorFormServ.keys
  getDayOfWeek = this.doorFormServ.getThaiDay
  getDayIndex = this.doorFormServ.genIndex
  getSlot = (day: TFormKey) => {
    const idx = this.getDayIndex(day)
    const data = this.timeMap().get(idx)
    return data ?? []
  }
=======
  id = this.doorMutServ.doorId
>>>>>>> 7b473f5093996e06fd3458a742f1a4cedbd08bb4
}
