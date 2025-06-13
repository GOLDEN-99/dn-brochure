import { inject, Injectable } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { TMapForm } from '../../types';
import { TCompAuth, TCondiBranch, TcondiReq, TCondiSup } from '../../types/ibob-supplier.type';
@Injectable({
  providedIn: 'root'
})
export class SupplierFromService {

  constructor() { }

  private fb = inject(FormBuilder)

  private authForm = this.fb.nonNullable.group({
    username: this.fb.nonNullable.control('', Validators.required),
    userpass: this.fb.nonNullable.control('', Validators.required)
  })

  patchAuth = (value: Partial<TCompAuth>) => {
    this.authForm.patchValue({ ...value })
  }

  addGeneralContacForm = () => this.form.controls.general.controls.contact.push(
    this.fb.nonNullable.group({
      emplPhone: this.fb.nonNullable.control('', Validators.required),
      emplName: this.fb.nonNullable.control("", Validators.required),
      emplEmail: this.fb.nonNullable.control("")
    })
  )

  removeGenralContactForm = (idx: number) =>
    this.form.controls.general.controls.contact.removeAt(idx)


  private generalForm: TGeneralForm = this.fb.nonNullable.group({
    compName: this.fb.nonNullable.control('', Validators.required),
    compName2: this.fb.nonNullable.control("", Validators.required),
    compAddr: this.fb.nonNullable.control("", Validators.required),
    contact: this.fb.nonNullable.array<TContacListForm>([this.fb.nonNullable.group({
      emplPhone: this.fb.nonNullable.control("", Validators.required),
      emplName: this.fb.nonNullable.control("", Validators.required),
      emplEmail: this.fb.nonNullable.control("")
    })], Validators.minLength(1)),
    compEmail: this.fb.nonNullable.control("", Validators.required),
    compFax: this.fb.nonNullable.control("", Validators.required),

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
    paymentTerms: this.fb.nonNullable.control(0, [Validators.required, Validators.min(0)]),
    tradePerDisc: this.fb.nonNullable.control(0, [Validators.min(0), Validators.max(100), Validators.required]),
    cashPerDisc: this.fb.nonNullable.control(0, [Validators.min(0), Validators.max(100), Validators.required]),
    dcPerDisc: this.fb.nonNullable.control(0, [Validators.min(0), Validators.max(100), Validators.required]),
  })


  private stepThreeForm: TStep3Form = this.fb.nonNullable.group({
    supplier: this.fb.nonNullable.control("", Validators.required),
    comp: this.fb.nonNullable.group<TMapForm<TComp>>({
      compGroupCode: this.fb.nonNullable.control("", [Validators.required]),
      compName: this.fb.nonNullable.control("", Validators.required)
    }),
    shipTo: this.fb.nonNullable.control("", Validators.required),
    orderRemark: this.fb.nonNullable.control("", Validators.required),
    emplList: this.emplListForm,
    payment: this.paymentForm,
    tax: this.fb.nonNullable.group({
      tax1: this.fb.nonNullable.control(false),
      tax2: this.fb.nonNullable.control(false),
      tax3: this.fb.nonNullable.control(false)
    })
  })

  private returnForm: TReturnForm = this.fb.nonNullable.group({
    before: this.fb.nonNullable.control(0),
    after: this.fb.nonNullable.control(0),
    whole: this.fb.nonNullable.control(false),
    lot: this.fb.nonNullable.control(false),
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

  getCondiSup = (): TCondiSup => {
    const defaultValue = {
      return: '0',
      fullBox: '0',
      sameLot: '0',
      monthBeforExp: 0,
      monthAfterExp: 0
    }
    const sup = this.form.controls.condi.get('sup') as TReturnForm | undefined

    if (!sup) {
      return {
        supReturn: defaultValue.return,
        supFullBox: defaultValue.fullBox,
        supSameLot: defaultValue.sameLot,
        supMonthBeforeExp: defaultValue.monthBeforExp,
        supMonthAfterExp: defaultValue.monthAfterExp
      }
    }
    const { before, after, whole, lot } = sup.getRawValue()
    return {
      supReturn: '1',
      supFullBox: whole ? '1' : '0',
      supSameLot: lot ? '1' : '0',
      supMonthBeforeExp: before,
      supMonthAfterExp: after
    }
  }

  getCondiBranch = (): TCondiBranch => {
    const defaultValue = {
      return: '0',
      fullBox: '0',
      sameLot: '0',
      monthBeforExp: 0,
      monthAfterExp: 0
    }
    const sup = this.form.controls.condi.get('branch') as TReturnForm | undefined

    if (!sup) {
      return {
        stkReturn: defaultValue.return,
        stkFullBox: defaultValue.fullBox,
        stkSameLot: defaultValue.sameLot,
        stkMonthBeforeExp: defaultValue.monthBeforExp,
        stkMonthAfterExp: defaultValue.monthAfterExp
      }
    }
    const { before, after, whole, lot } = sup.getRawValue()
    return {
      stkReturn: '1',
      stkFullBox: whole ? '1' : '0',
      stkSameLot: lot ? '1' : '0',
      stkMonthBeforeExp: before,
      stkMonthAfterExp: after
    }
  }

  getCondi = (): TcondiReq => {
    const sup = this.getCondiSup()
    const stk = this.getCondiBranch()
    return {
      ...sup,
      ...stk,
    }
  }
}

type TAuthForm = FormGroup<{
  username: FormControl<string>
  userpass: FormControl<string>
}>

type TContacListForm = FormGroup<{
  emplPhone: FormControl<string>
  emplName: FormControl<string>
  emplEmail: FormControl<string>
}>

type TComp = { compGroupCode: string, compName: string }

type TCompForm = FormGroup<TMapForm<TComp>>

type TGeneralForm = FormGroup<{
  compName: FormControl<string>
  compName2: FormControl<string>
  compAddr: FormControl<string>
  contact: FormArray<TContacListForm>
  compFax: FormControl<string>
  compEmail: FormControl<string>
}>

type TEmpl = {
  emplName: string
  emplEmail: string
}
type TEmplItemForm = FormGroup<TMapForm<TEmpl>>

type TEmplListForm = FormArray<TEmplItemForm>

type TSupplierPayment = {
  paymentTerms: number
  tradePerDisc: number
  cashPerDisc: number
  dcPerDisc: number
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
  orderRemark: FormControl<string>
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

export type TCondiForm = FormGroup<{
  sup?: TReturnForm
  branch?: TReturnForm
}>

export type TForm = FormGroup<{
  auth: TAuthForm
  general: TGeneralForm
  stepThree: TStep3Form
  condi: TCondiForm
}>
