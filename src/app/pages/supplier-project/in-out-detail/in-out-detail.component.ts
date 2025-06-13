import { Component, inject } from '@angular/core';
import { DoorMutationService } from '../../../service/ibob/door-mutation.service';
import { FormsModule } from '@angular/forms';
import { NgbTimepicker } from '@ng-bootstrap/ng-bootstrap';
import { RouterLink } from '@angular/router';
import { DoorFormEditService } from '../../../service/ibob/door-form-edit.service';
import { TFormKey } from '../../../service/ibob/baseDoorForm';

@Component({
  selector: 'app-in-out-detail',
  imports: [FormsModule, NgbTimepicker, RouterLink],
  templateUrl: './in-out-detail.component.html',
  styleUrl: './in-out-detail.component.scss'
})
export class InOutDetailComponent {
  private doorMutServ = inject(DoorMutationService)
  private doorFormServ = inject(DoorFormEditService)
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
}

