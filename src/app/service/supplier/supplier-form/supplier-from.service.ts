import { inject, Injectable } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { TMapForm } from '../../../types';

@Injectable({
  providedIn: 'root'
})
export class SupplierFromService {

  constructor() { }

  private fb = inject(FormBuilder)

  private authForm = this.fb.nonNullable.group({
    username: this.fb.nonNullable.control('', Validators.required),
    password: this.fb.nonNullable.control("", Validators.required)
  })

  addGeneralContacForm = () => this.form.controls.general.controls.contact.push(
    this.fb.nonNullable.group({
      tel: this.fb.nonNullable.control('', Validators.required),
      name: this.fb.nonNullable.control("", Validators.required)
    })
  )

  removeGenralContactForm = (idx: number) =>
    this.form.controls.general.controls.contact.removeAt(idx)


  private generalForm: TGeneralForm = this.fb.nonNullable.group({
    thaiName: this.fb.nonNullable.control('', Validators.required),
    engName: this.fb.nonNullable.control("", Validators.required),
    address: this.fb.nonNullable.control("", Validators.required),
    contact: this.fb.nonNullable.array<TContacListForm>([this.fb.nonNullable.group({
      tel: this.fb.nonNullable.control('', Validators.required),
      name: this.fb.nonNullable.control("", Validators.required)
    })], Validators.minLength(1)),
    email: this.fb.nonNullable.control("", Validators.required),
    teleGram: this.fb.nonNullable.control("", Validators.required),

  })

  addEmplList = () => this.form.controls.stepThree.controls.emplList.controls.push(
    this.fb.nonNullable.group({
      emplName: this.fb.nonNullable.control("", Validators.required),
      emplEmail: this.fb.nonNullable.control("", Validators.required)
    })
  )

  removeEmplList = (idx: number) => this.form.controls.stepThree.controls.emplList.removeAt(idx)

  private emplListForm: TEmplListForm = this.fb.nonNullable.array([this.fb.nonNullable.group({
    emplName: this.fb.nonNullable.control("", Validators.required),
    emplEmail: this.fb.nonNullable.control("", Validators.required)
  })], Validators.minLength(1))

  private paymentForm: TPaymentForm = this.fb.nonNullable.group({
    duration: this.fb.nonNullable.control(0, [Validators.required, Validators.min(0)]),
    saleDiscount: this.fb.nonNullable.control(0, [Validators.min(0), Validators.max(100), Validators.required]),
    cashDiscount: this.fb.nonNullable.control(0, [Validators.min(0), Validators.max(100), Validators.required]),
    dcDiscount: this.fb.nonNullable.control(0, [Validators.min(0), Validators.max(100), Validators.required]),
  })


  private stepThreeForm: TStep3Form = this.fb.nonNullable.group({
    supplier: this.fb.nonNullable.control("", Validators.required),
    comp: this.fb.nonNullable.group<TMapForm<TComp>>({
      compId: this.fb.nonNullable.control(0, [Validators.required, Validators.min(1)]),
      compName: this.fb.nonNullable.control("", Validators.required)
    }),
    shipTo: this.fb.nonNullable.control("", Validators.required),
    remark: this.fb.nonNullable.control("", Validators.required),
    emplList: this.emplListForm,
    payment: this.paymentForm,
    tax: this.fb.nonNullable.group({
      tax1: this.fb.nonNullable.control(false),
      tax2: this.fb.nonNullable.control(false),
      tax3: this.fb.nonNullable.control(false)
    })
  })

  private condiForm: TCondiForm = this.fb.nonNullable.group({})

  addCondi = (key: 'sup' | 'branch') => () => {
    const f: TReturnForm = this.fb.nonNullable.group({
      before: this.fb.nonNullable.control(0, Validators.required),
      after: this.fb.nonNullable.control(0, Validators.required),
      whole: this.fb.nonNullable.control(false, Validators.required),
      lot: this.fb.nonNullable.control(false, Validators.required),
    })

    this.form.controls.condi.addControl(key, f)
  }

  removeCondi = (key: 'sup' | 'branch') => () => {
    this.form.controls.condi.removeControl(key)
  }

  form: TForm = this.fb.nonNullable.group({
    auth: this.authForm,
    general: this.generalForm,
    stepThree: this.stepThreeForm,
    condi: this.condiForm
  })
}

type TAuthForm = FormGroup<{
  username: FormControl<string>
  password: FormControl<string>
}>

type TContacListForm = FormGroup<{
  tel: FormControl<string>
  name: FormControl<string>
}>

type TComp = { compId: number, compName: string }

type TCompForm = FormGroup<TMapForm<TComp>>

type TGeneralForm = FormGroup<{
  thaiName: FormControl<string>
  engName: FormControl<string>
  address: FormControl<string>
  contact: FormArray<TContacListForm>
  teleGram: FormControl<string>
  email: FormControl<string>
}>

type TEmpl = {
  emplName: string
  emplEmail: string
}
type TEmplItemForm = FormGroup<TMapForm<TEmpl>>

type TEmplListForm = FormArray<TEmplItemForm>

type TSupplierPayment = {
  duration: number
  saleDiscount: number
  cashDiscount: number
  dcDiscount: number
}

type TPaymentForm = FormGroup<TMapForm<TSupplierPayment>>

type TTax = 1 | 2 | 3

type TTaxForm = FormGroup<TMapForm<{
  tax1: boolean
  tax2: boolean
  tax3: boolean
}>>

type TStep3Form = FormGroup<{
  supplier: FormControl<string>
  comp: TCompForm
  remark: FormControl<string>
  shipTo: FormControl<string>
  emplList: TEmplListForm
  payment: TPaymentForm
  tax: TTaxForm
}>

export type TReturnDetail = {
  before: number
  after: number
  whole: boolean
  lot: boolean
}

export type TReturnForm = FormGroup<TMapForm<TReturnDetail>>

export type TCondiForm = FormGroup<TMapForm<{
  sup?: TReturnForm
  branch?: TReturnForm
}>>

export type TForm = FormGroup<{
  auth: TAuthForm
  general: TGeneralForm
  stepThree: TStep3Form
  condi: TCondiForm
}>
