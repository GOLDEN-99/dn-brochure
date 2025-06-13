import { Injectable } from '@angular/core';
import { BaseDoorForm, TDuration, TDurationSubForm, TFormKey, TSlotForm } from './baseDoorForm';
import { NgbTimeStruct } from '@ng-bootstrap/ng-bootstrap';
import { Validators } from '@angular/forms';
import { TCreateTimeSlot } from '../../types/ibob-supplier.type';

@Injectable({
  providedIn: 'root'
})
export class DoorFormCreateService extends BaseDoorForm<TDuration> {

  override slotForm: TSlotForm<TDuration> = this.nnfb.group({
    mon: this.nnfb.array<TDurationSubForm>([]),
    tue: this.nnfb.array<TDurationSubForm>([]),
    wed: this.nnfb.array<TDurationSubForm>([]),
    thu: this.nnfb.array<TDurationSubForm>([]),
    fri: this.nnfb.array<TDurationSubForm>([]),
    sat: this.nnfb.array<TDurationSubForm>([]),
    sun: this.nnfb.array<TDurationSubForm>([]),
  })

  override addForm = (ctrlName: TFormKey) => {
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
        form: this.nnfb.control<NgbTimeStruct>(startTime, [Validators.required]),
        to: this.nnfb.control<NgbTimeStruct>(endTime, [Validators.required]),
      }))
  }

  override patchForm = (ctrlName: TFormKey) => (value: TDuration) => { }

  override get request() {
    const rawHead = this.headForm.getRawValue()
    const time = this.keys.flatMap<TCreateTimeSlot>(
      (k) => {
        const value = this.slotForm.controls[k].getRawValue()
        const dayId = this.genIndex(k)
        const dayName = this.getThaiDay(k)
        if (value.length === 0) return [{ dayId, dayName, startTime: null, endTime: null, isAvailable: false }]
        return value.map(({ form, to }) => ({ dayId, dayName, startTime: this.formatTime(form), endTime: this.formatTime(to), isAvailable: true }))
      }
    )
    return {
      door: { ...rawHead, multiple: rawHead.multiple ? '1' : '0' },
      time
    }
  }

}
