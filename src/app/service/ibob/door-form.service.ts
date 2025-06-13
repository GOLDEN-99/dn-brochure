import { inject, Injectable, signal } from '@angular/core';
import { FormArray, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { NgbTimeStruct } from '@ng-bootstrap/ng-bootstrap';
import { TMapForm } from '../../types';
import { TCreateTimeSlot } from '../../types/ibob-supplier.type';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root'
})
export class DoorFormService {

  constructor() {
    this.headForm.controls.timeUse.valueChanges
      .pipe(
        filter(d => d >= 0),
        takeUntilDestroyed()
      ).subscribe((d) => this.durationStep.update(() => d))
  }

  private nnfb = inject(NonNullableFormBuilder)

  durationStep = signal<number>(5)

  headForm = this.nnfb.group({
    doorname: this.nnfb.control("", [Validators.required]),
    timeUse: this.nnfb.control(5, [Validators.required, Validators.min(1)]),
    note: this.nnfb.control(""),
    intendant: this.nnfb.control("", [Validators.required]),
    mail: this.nnfb.control("", [Validators.required, Validators.email]),
    multiple: this.nnfb.control(false)
  })

  slotForm: TMainForm = this.nnfb.group({
    mon: this.nnfb.array<TDurationSubForm>([]),
    tue: this.nnfb.array<TDurationSubForm>([]),
    wed: this.nnfb.array<TDurationSubForm>([]),
    thu: this.nnfb.array<TDurationSubForm>([]),
    fri: this.nnfb.array<TDurationSubForm>([]),
    sat: this.nnfb.array<TDurationSubForm>([]),
    sun: this.nnfb.array<TDurationSubForm>([]),
  })

  slotEditForm: TEditMainForm = this.nnfb.group({
    mon: this.nnfb.array<TEditDurationSubForm>([]),
    tue: this.nnfb.array<TEditDurationSubForm>([]),
    wed: this.nnfb.array<TEditDurationSubForm>([]),
    thu: this.nnfb.array<TEditDurationSubForm>([]),
    fri: this.nnfb.array<TEditDurationSubForm>([]),
    sat: this.nnfb.array<TEditDurationSubForm>([]),
    sun: this.nnfb.array<TEditDurationSubForm>([]),
  })

  keys = Object.keys(this.slotForm.controls) as TFormKey[]

  addForm = (ctrlName: TFormKey) => {
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

  addEditForm = (ctrlName: TFormKey, doorId: number) => {
    const ref = this.slotEditForm.controls[ctrlName]
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
      this.slotEditForm.controls[ctrlName]
        .push(this.nnfb.group({
          id: this.nnfb.control(-1),
          doorId: this.nnfb.control(doorId),
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
    this.slotEditForm.controls[ctrlName]
      .push(this.nnfb.group({
        id: this.nnfb.control(-1),
        doorId: this.nnfb.control(doorId),
        form: this.nnfb.control<NgbTimeStruct>(startTime, [Validators.required]),
        to: this.nnfb.control<NgbTimeStruct>(endTime, [Validators.required]),
      }))
  }

  getDisableState = (ctrl: TDurationSubForm | TEditDurationSubForm) => {
    const form = ctrl.controls.form.getRawValue()
    const to = ctrl.controls.to.getRawValue()
    return (form.hour === to.hour && form.minute >= to.minute) || form.hour > to.hour || form.hour < 8 || to.hour >= 17
  }

  removeForm = (key: TFormKey, j: number) => this.slotForm.controls[key].removeAt(j)

  removeEditForm = (key: TFormKey, j: number) => this.slotEditForm.controls[key].removeAt(j)

  getThaiDay = (k: TFormKey) => {
    switch (k) {
      case 'sun': return 'วันอาทิตย์'
      case 'mon': return 'วันจันทร์'
      case 'tue': return 'วันอังคาร'
      case 'wed': return 'วันพุธ'
      case 'thu': return 'วันพฤหัส'
      case 'fri': return 'วันศุกร์'
      case 'sat': return 'วันเสาร์'
    }
  }

  genIndex = (k: TFormKey) => {
    switch (k) {
      case 'sun': return 7
      case 'mon': return 1
      case 'tue': return 2
      case 'wed': return 3
      case 'thu': return 4
      case 'fri': return 5
      case 'sat': return 6
    }
  }

  private formatTime = (t: NgbTimeStruct) => {
    const { hour, minute } = t
    return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`
  }

  private prepareArray = (d: TDayDetail) => ({ form, to, ...res }: TDuration): TCreateTimeSlot => ({
    startTime: this.formatTime(form),
    endTime: this.formatTime(to),
    ...res,
    ...d,
    isAvailable: true
  })

  private preparedArrWithDay = (d: TFormKey) => {
    const dayId = this.genIndex(d)
    const dayName = this.getThaiDay(d)
    return this.prepareArray({ dayId, dayName })
  }

  getFormHead = () => {
    const { mail, multiple, doorname, note, intendant, timeUse } = this.headForm.getRawValue()
    return { doorname, timeUse, note, intendant, mail, multiple: multiple ? "1" : "0" }
  }

  getTimeList = () => {
    const rawList = this.slotForm.getRawValue()
    const keyList = Object.keys(rawList) as TFormKey[]


    const formattedList = keyList.flatMap(
      (d) => {
        const partialFn = this.preparedArrWithDay(d)
        const temp = rawList[d]
        return temp.length === 0
          ? [{
            startTime: null,
            endTime: null,
            dayId: this.genIndex(d),
            dayName: this.getThaiDay(d),
            isAvailable: false
          }]
          : temp.map(partialFn)
      })

    return formattedList
  }

  getTimeListEdit = () => {
    const rawList = this.slotEditForm.getRawValue()
    const keyList = Object.keys(rawList) as TFormKey[]

    const formattedList = keyList.flatMap(
      (d) => {
        const partialFn = this.preparedArrWithDay(d)
        const temp = rawList[d]
        return temp.length === 0
          ? [{
            id: -1,
            startTime: null,
            endTime: null,
            dayId: this.genIndex(d),
            dayName: this.getThaiDay(d),
            isAvailable: false
          }]
          : temp.map(partialFn)
      })

    return formattedList
  }
}


export type TDayDetail = {
  dayId: number
  dayName: string
}

export type TDuration = {
  form: NgbTimeStruct,
  to: NgbTimeStruct
}

export type TDurationSubForm = FormGroup<TMapForm<TDuration>>

export type TFormKey = 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat'

export type TMainForm = FormGroup<{
  [key in TFormKey]: FormArray<TDurationSubForm>
}>

export type TEditableDuration = { doorId: number, id: number } & TDuration

export type TEditDurationSubForm = FormGroup<TMapForm<TEditableDuration>>

export type TEditMainForm = FormGroup<{
  [key in TFormKey]: FormArray<TEditDurationSubForm>
}>