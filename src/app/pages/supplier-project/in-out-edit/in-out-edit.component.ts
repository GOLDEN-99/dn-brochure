import { Component, computed, inject, OnDestroy, OnInit, signal, viewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DoorMutationService } from '../../../service/ibob/door-mutation.service';
import { RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { DoorFormEditService } from '../../../service/ibob/door-form-edit.service';
import { TimeslotRowComponent } from "../../../components/inbound-outbound/timeslot-row/timeslot-row.component";
import { ToastService } from '../../../service/toast/toast.service';
import { NgbModal, NgbTimeStruct } from '@ng-bootstrap/ng-bootstrap';
import { IbobAddTimeModalComponent } from '../../../components/inbound-outbound/modal/ibob-add-time-modal/ibob-add-time-modal.component';
import { TDuration, TFormKey } from '../../../service/ibob/baseDoorForm';

@Component({
  selector: 'app-in-out-edit',
  imports: [ReactiveFormsModule, FormsModule, RouterLink, TimeslotRowComponent, IbobAddTimeModalComponent],
  templateUrl: './in-out-edit.component.html',
  styles: ''
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
  slotForm = this.doorFormServ.slotEditForm
  dayKey = this.doorFormServ.keys
  getDayOfWeek = this.doorFormServ.getThaiDay
  addForm = this.doorFormServ.addEditForm
  removeForm = this.doorFormServ.removeEditForm
  getDisable = this.doorFormServ.getDisableState
  private toastServ = inject(ToastService)

  submitForm = () => {
    const req = this.doorFormServ.request
    this.doorMutServ.updateDoor(req).subscribe({
      next: () => { this.toastServ.success('แก้ไขสำเร็จ') },
      error: (err) => { console.error(err); this.toastServ.danger(String(err.message)) }
    })
  }

  patchValueAt = this.doorFormServ.updateForm


  deleteSlot = (slotId: number) => {
    this.doorMutServ.deleteTimeSlot(slotId).subscribe({
      next: () => this.toastServ.success('ลบสำเร็จ'),
      error: (err) => this.toastServ.danger(err.error)
    })
  }

  private content = viewChild('content')
  private modalServ = inject(NgbModal)
  private currentKey = signal<TFormKey>('mon')
  currentDay = computed(() => this.doorFormServ.getThaiDay(this.currentKey()))
  last = signal<NgbTimeStruct>({ hour: 0, minute: 0, second: 0 })
  openAddModal(day: TFormKey) {
    this.currentKey.update(p => day)
    const lst = this.slotForm.controls[day].getRawValue()
    const len = lst.length
    if (len === 0) {
      this.last.set({ hour: 8, minute: 30, second: 0 })
    } else {
      const { to } = lst[len - 1]
      this.last.set({ ...to })
    }
    const ref = this.modalServ.open(this.content())
  }

  onAddSlot(range: TDuration) {
    const dayId = this.doorFormServ.genIndex(this.currentKey())
    const dayName = this.currentDay()
    const { form, to } = range
    const startTime = this.doorFormServ.formatTime(form)
    const endTime = this.doorFormServ.formatTime(to)
    this.doorMutServ.addTimeSlot({ dayId, dayName, startTime, endTime }).subscribe({
      next: () => { this.toastServ.success('เพิ่มประตูสำเร็จ') },
      error: (err) => this.toastServ.danger(err.message),
      complete: () => {
        this.modalServ.dismissAll();
        this.doorMutServ.refetch()
      }
    })
  }

}
