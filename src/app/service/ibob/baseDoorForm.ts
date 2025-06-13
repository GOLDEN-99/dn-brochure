import { FormArray, FormGroup, NonNullableFormBuilder, Validators } from "@angular/forms"
import { NgbTimeStruct } from "@ng-bootstrap/ng-bootstrap"
import { TMapForm } from "../../types"
import { inject, signal } from "@angular/core"
import { filter } from "rxjs"
import { takeUntilDestroyed } from "@angular/core/rxjs-interop"
import { TCreateTimeSlot, TDoor, TDoorInfo, TTimeSlot, TTimeSlotInfo } from "../../types/ibob-supplier.type"
export abstract class BaseDoorForm<T extends TEditableDuration | TDuration> {
    constructor() {
        this.headForm.controls.timeUse.valueChanges
            .pipe(
                filter(d => d >= 0),
                takeUntilDestroyed()
            ).subscribe((d) => this.durationStep.update(() => d))
    }

    protected nnfb = inject(NonNullableFormBuilder)

    durationStep = signal<number>(5)

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

    dayId2Key = (id: number): TFormKey => {
        switch (id) {
            case 1: return 'mon'
            case 2: return 'tue'
            case 3: return 'wed'
            case 4: return 'thu'
            case 5: return 'fri'
            case 6: return 'sat'
            case 7: return 'sun'
            default: throw new Error('invalid day id')
        }
    }

    keys: TFormKey[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']

    headForm = this.nnfb.group({
        doorname: this.nnfb.control("", [Validators.required]),
        timeUse: this.nnfb.control(5, [Validators.required, Validators.min(1)]),
        note: this.nnfb.control(""),
        intendant: this.nnfb.control("", [Validators.required]),
        mail: this.nnfb.control("", [Validators.required, Validators.email]),
        minBox: this.nnfb.control(0, [Validators.required, Validators.min(0)]),
        maxBox: this.nnfb.control(0, [Validators.required, Validators.min(0)]),
        multiple: this.nnfb.control(false)
    })

    abstract slotForm: TSlotForm<T>

    getFormHead = () => {
        const { mail, multiple, doorname, note, intendant, timeUse } = this.headForm.getRawValue()
        return { doorname, timeUse, note, intendant, mail, multiple: multiple ? "1" : "0" }
    }

    clearForm = () => {
        this.slotForm.controls.mon.clear()
        this.slotForm.controls.tue.clear()
        this.slotForm.controls.wed.clear()
        this.slotForm.controls.thu.clear()
        this.slotForm.controls.fri.clear()
        this.slotForm.controls.sat.clear()
        this.slotForm.controls.sun.clear()
    }

    getDisableState = (ctrl: TDurationSubForm | TEditDurationSubForm) => {
        const form = ctrl.controls.form.getRawValue()
        const to = ctrl.controls.to.getRawValue()
        return (form.hour === to.hour && form.minute >= to.minute) || form.hour > to.hour || form.hour < 8 || to.hour >= 17
    }

    removeForm(key: TFormKey, idx: number) {
        this.slotForm.controls[key].removeAt(idx)
    }

    formatTime = (t: NgbTimeStruct) => {
        const { hour, minute } = t
        return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`
    }

    protected invalidMorning(min: number) {
        const lowerBound = (8 * 60) + 30
        const upperBound = (12 * 60)
        return min < lowerBound && min > upperBound
    }

    protected invalidAfternoon(min: number) {
        const lowerBound = (13 * 60)
        const upperBound = (17 * 60) + 30
        return min < lowerBound && min > upperBound
    }

    abstract addForm(ctrlName: TFormKey): void

    abstract patchForm(ctrlName: TFormKey): (value: T) => void

    abstract updateForm(ctrlName: TFormKey, idx: number): (value: Partial<T>) => void

    abstract get request(): T extends TEditableDuration ? TEditDoorReq : TCreateDoorReq
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

export type TSlotForm<T extends TDuration | TEditableDuration> = FormGroup<{
    [key in TFormKey]: FormArray<FormGroup<TMapForm<T>>>
}>
type TDoorState = Pick<TDoor, 'note' | 'intendant' | 'maxBox' | 'minBox' | 'multiple' | 'timeUse'> & { doorname: string }
type TEditDoorReq = { door: TDoorState, time: TTimeSlotInfo[] }
type TCreateDoorReq = { door: TDoorState, time: TCreateTimeSlot[] }

