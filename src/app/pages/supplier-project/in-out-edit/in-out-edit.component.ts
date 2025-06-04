import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbTimepicker } from '@ng-bootstrap/ng-bootstrap';
import { DoorMutationService } from '../../../service/ibob/door-mutation.service';
import { RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { DoorFormEditService } from '../../../service/ibob/door-form-edit.service';

@Component({
  selector: 'app-in-out-edit',
  imports: [NgbTimepicker, ReactiveFormsModule, FormsModule, RouterLink],
  templateUrl: './in-out-edit.component.html',
  styleUrl: './in-out-edit.component.scss'
})
export class InOutEditComponent implements OnInit, OnDestroy {
  doorFormServ = inject(DoorFormEditService)
  doorMutServ = inject(DoorMutationService)
  private des$ = new Subject<void>()
  ngOnInit(): void {
    this.doorMutServ.sharedDoor$.pipe(takeUntil(this.des$)).subscribe({
      next: res => {
        if (!res) return
        this.doorFormServ.clearForm()
        const { door, time } = res
        const { doorname, doorId, timeUse, note, intendant, mail, multiple, minBox, maxBox } = door
        this.doorFormServ.currentDoorId = Number(doorId)
        this.headForm.patchValue({
          doorname, timeUse, note, intendant: intendant ?? '', mail, multiple: multiple === '1', minBox, maxBox
        })
        const timeMap = this.doorMutServ.createTimeMap(time)
        const v = [...timeMap.entries()]
        v.forEach(([day, value]) => {
          const partialAdd = this.doorFormServ.patchForm(this.doorFormServ.dayId2Key(day))
          value.forEach(partialAdd)
        })
      }
    })
  }

  ngOnDestroy(): void {
    this.des$.next()
    this.des$.complete()
  }

  doorHead = this.doorMutServ.doorHead
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
    this.doorMutServ.updateDoor(req).subscribe({
      next: () => { console.log('update ok') },
      error: (err) => { console.error(err) }
    })
  }

}
