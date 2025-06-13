import { Injectable } from '@angular/core';
import { BaseDoorForm, TEditableDuration, TEditDurationSubForm, TFormKey, TSlotForm } from './baseDoorForm';
import { NgbTimeStruct } from '@ng-bootstrap/ng-bootstrap';
import { Validators } from '@angular/forms';
import { TEditTimeSlot } from '../../types/ibob-supplier.type';

@Injectable({
  providedIn: 'root'
})
export class DoorFormEditService extends BaseDoorForm<TEditableDuration> {

  override slotForm: TSlotForm<TEditableDuration> = this.nnfb.group({
    mon: this.nnfb.array<TEditDurationSubForm>([]),
    tue: this.nnfb.array<TEditDurationSubForm>([]),
    wed: this.nnfb.array<TEditDurationSubForm>([]),
    thu: this.nnfb.array<TEditDurationSubForm>([]),
    fri: this.nnfb.array<TEditDurationSubForm>([]),
    sat: this.nnfb.array<TEditDurationSubForm>([]),
    sun: this.nnfb.array<TEditDurationSubForm>([]),
  })

  currentDoorId: number = 0

  override addForm: (ctrlName: TFormKey) => void = (ctrlName: TFormKey) => {
    if (this.currentDoorId === 0) return
    const ref = this.slotForm.controls[ctrlName]
    const a = ref.getRawValue()
    const lenA = a.length
    if (lenA !== 0) {
      const { form, to } = a[lenA - 1]
      const nextForm = to
      const { hour, minute } = to
      const validNextFormHour = hour !== 12 ? hour : 13
      const validNextForm = { hour: validNextFormHour, minute, second: 0 }
      const nextHour = nextForm.hour < 12 ? 12 : 17
      const nextTo = { hour: nextHour, minute: nextHour !== 17 ? 0 : 30, second: 0 }
      this.slotForm.controls[ctrlName]
        .push(this.nnfb.group({
          id: this.nnfb.control(0),
          doorId: this.nnfb.control(this.currentDoorId),
          form: this.nnfb.control<NgbTimeStruct>(validNextForm, [Validators.required]),
          to: this.nnfb.control<NgbTimeStruct>(nextTo, [Validators.required]),
        }))
      return
    }
    const startTime = {
      hour: 8,
      minute: 30,
      second: 0
    }
    const endTime = {
      hour: 12,
      minute: 0,
      second: 0
    }
    this.slotForm.controls[ctrlName]
      .push(this.nnfb.group({
        id: this.nnfb.control(0),
        doorId: this.nnfb.control(this.currentDoorId),
        form: this.nnfb.control<NgbTimeStruct>(startTime, [Validators.required]),
        to: this.nnfb.control<NgbTimeStruct>(endTime, [Validators.required]),
      }))
  }

  override patchForm = (ctrlName: TFormKey) => ({ id, doorId, to, form }: TEditableDuration) => {
    const entry: TEditDurationSubForm = this.nnfb.group({
      id: this.nnfb.control(id),
      doorId: this.nnfb.control(doorId),
      to: this.nnfb.control(to),
      form: this.nnfb.control(form)
    })
    this.slotForm.controls[ctrlName].push(entry)
  }


  override get request() {
    const rawHead = this.headForm.getRawValue()
    const time = this.keys.flatMap<TEditTimeSlot>(
      (k) => {
        const value = this.slotForm.controls[k].getRawValue()
        const timeUse = rawHead.timeUse
        const dayId = this.genIndex(k)
        const dayName = this.getThaiDay(k)
        if (value.length === 0) return [
          {
            id: 0,
            dayId, dayName,
            doorId: this.currentDoorId, multiple: rawHead.multiple ? '1' : '0',
            isAvailable: false,
            startTime: null,
            endTime: null
          }
        ]
        return value.map(({ form, to, doorId, id }) => ({ id, doorId, dayId, dayName, startTime: this.formatTime(form), endTime: this.formatTime(to), isAvailable: true, timeUse }))
      }
    )
    return {
      door: { ...rawHead, doorId: String(this.currentDoorId), multiple: rawHead.multiple ? '1' : '0' },
      time
    }
  }

}
