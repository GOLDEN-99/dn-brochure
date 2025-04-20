import { inject, Injectable } from '@angular/core';
import { FormArray, FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { TMapForm } from '../../../types';

@Injectable({
  providedIn: 'root'
})
export class SupplierFromService {

  constructor() { }

  private nnfb = inject(NonNullableFormBuilder)
  private authForm = this.nnfb.group({
    username: this.nnfb.control('', Validators.required),
    password: this.nnfb.control("", Validators.required)
  })

  addGeneralContacForm = () => this.form.controls.general.controls.contact.push(
    this.nnfb.group({
      tel: this.nnfb.control('', Validators.required),
      name: this.nnfb.control("", Validators.required)
    })
  )

  removeGenralContactForm = (idx: number) =>
    this.form.controls.general.controls.contact.removeAt(idx)


  private generalForm: TGeneralForm = this.nnfb.group({
    thaiName: this.nnfb.control('', Validators.required),
    engName: this.nnfb.control("", Validators.required),
    address: this.nnfb.control("", Validators.required),
    contact: this.nnfb.array<TContacListForm>([this.nnfb.group({
      tel: this.nnfb.control('', Validators.required),
      name: this.nnfb.control("", Validators.required)
    })], Validators.minLength(1)),
    email: this.nnfb.control("", Validators.required),
    teleGram: this.nnfb.control("", Validators.required),
    supplier: this.nnfb.control("", Validators.required),
    comp: this.nnfb.group<TMapForm<TComp>>({
      compId: this.nnfb.control(0, [Validators.required, Validators.min(1)]),
      compName: this.nnfb.control("", Validators.required)
    }),
    shipTo: this.nnfb.control("", Validators.required),
    remark: this.nnfb.control("", Validators.required),
  })

  addEmplList = () => this.form.controls.emplList.controls.push(
    this.nnfb.group({
      emplName: this.nnfb.control("", Validators.required),
      emplEmail: this.nnfb.control("", Validators.required)
    })
  )

  private emplListForm: TEmplListForm = this.nnfb.array([this.nnfb.group({
    emplName: this.nnfb.control("", Validators.required),
    emplEmail: this.nnfb.control("", Validators.required)
  })], Validators.minLength(1))

  private paymentForm: TPaymentForm = this.nnfb.group({
    duration: this.nnfb.control(0, [Validators.required, Validators.min(0)]),
    saleDiscont: this.nnfb.control(0, [Validators.min(0), Validators.max(100), Validators.required]),
    cashDiscount: this.nnfb.control(0, [Validators.min(0), Validators.max(100), Validators.required]),
    dcDiscount: this.nnfb.control(0, [Validators.min(0), Validators.max(100), Validators.required]),
  })

  private tariffForm: TTariffForm = this.nnfb.group({
    payment: this.paymentForm,
    tax: this.nnfb.control<TTax[]>([], Validators.minLength(1))
  })

  form: TForm = this.nnfb.group({ auth: this.authForm, general: this.generalForm, emplList: this.emplListForm, tariff: this.tariffForm })
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
  supplier: FormControl<string>
  email: FormControl<string>
  comp: TCompForm
  remark: FormControl<string>
  shipTo: FormControl<string>
}>

type TEmpl = {
  emplName: string
  emplEmail: string
}
type TEmplItemForm = FormGroup<TMapForm<TEmpl>>

type TEmplListForm = FormArray<TEmplItemForm>

type TSupplierPayment = {
  duration: number
  saleDiscont: number
  cashDiscount: number
  dcDiscount: number
}

type TPaymentForm = FormGroup<TMapForm<TSupplierPayment>>

type TTax = 1 | 2 | 3

type TTaxForm = FormControl<TTax[]>

type TTariffForm = FormGroup<{
  payment: TPaymentForm,
  tax: TTaxForm
}>

type TForm = FormGroup<{
  auth: TAuthForm
  general: TGeneralForm
  emplList: TEmplListForm
  tariff: TTariffForm
}>
