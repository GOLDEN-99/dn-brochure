import { computed, inject, Injectable, signal } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { TMapForm } from '../../types';
import { TCompAuth, TCondiBranch, TcondiReq, TCondiSup } from '../../types/ibob-supplier.type';
import { TDNCreate, THUCreate, TItem } from './supplier-api.service';
@Injectable({
  providedIn: 'root'
})
export class SupplierFromService {

  constructor() { }

  private fb = inject(FormBuilder)

  private initialState: TFormState = {
    compCode: '',
    compName: '',
    compName2: '',
    compAddr: '',
    compFax: '',
    compPhone: '',
    compEmail: '',
    compStat: '1',
    compGroupCode: '',
    parentCompCode: '',
    shipTo: '',
    orderRemark: '',
    orderFileType: '',
    cashPerDisc: 0,
    dcPerDisc: 0,
    tradePerDisc: 0,
    paymentTerms: 30,
    billIncludeVAT: false,
    fixedPrice: false,
    registered: false,
    supReturn: false,
    supFullBox: false,
    supSameLot: false,
    supMonthAfterExp: 0,
    supMonthBeforeExp: 0,
    stkReturn: false,
    stkFullBox: false,
    stkSameLot: false,
    stkMonthAfterExp: 0,
    stkMonthBeforeExp: 0,
    username: '',
    userpass: '',
    updateDate: null,
    sapUpdateDate: null,
    timeStamp: null
  }

  item = signal<TIbAppItem[]>([]);
  updateItem = <K extends keyof TIbAppItem>(key: K) => (value: TIbAppItem[K], index: number) =>
    this.item.update(prev => prev.map((p, i) => i === index ? ({ ...p, [key]: value }) : p))

  inintialEmpl: TEmplState = { emplEmail: '', emplName: '', emplPhone: '' }
  emplList = signal<TEmplState[]>([this.inintialEmpl])
  addEmpl = () => this.emplList
    .update(prev => [...prev, this.inintialEmpl])
  removeEmpl = (index: number) => this.emplList
    .update(
      prev => prev.filter((_, i) => i !== index)
    )

  formState = signal(this.initialState)
  updator = <K extends keyof TFormState>(key: K) =>
    (value: TFormState[K]) => this.formState
      .update(prev => ({ ...prev, [key]: value }))

  setCompCode = (compCode: string) => this.formState
    .update(prev => ({ ...prev, compCode }))

  private authForm = this.fb.nonNullable.group({
    username: this.fb.nonNullable.control('', Validators.required),
    userpass: this.fb.nonNullable.control('', Validators.required)
  })

  patchAuth = (value: Partial<TCompAuth>) => {
    this.authForm.patchValue({ ...value })
  }

  addGeneralContacForm = () => this.form.controls.general.controls.contact.push(
    this.fb.nonNullable.group({
      emplName: this.fb.nonNullable.control("", Validators.required),
      emplPhone: this.fb.nonNullable.control("", Validators.required),
      emplEmail: this.fb.nonNullable.control("")
    })
  )

  createGeneralContactForm = ({ emplName, emplPhone, emplEmail }: { emplName: string, emplPhone: string, emplEmail: string }): TContacListForm => {
    return this.fb.nonNullable.group({
      emplName: this.fb.nonNullable.control(emplName, Validators.required),
      emplPhone: this.fb.nonNullable.control(emplPhone, Validators.required),
      emplEmail: this.fb.nonNullable.control(emplEmail)
    })
  }

  setContactForm = (arr: { emplName: string, emplPhone: string, emplEmail: string }[]) => {
    const temp = this.fb.nonNullable.array<TContacListForm>([])
    arr.forEach(a => {
      const form = this.createGeneralContactForm(a)
      temp.push(form)
    })
    this.generalForm.controls.contact = temp
  }

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
    compPhone: this.fb.nonNullable.control("", Validators.required),

  })

  // addEmplList = () => this.form.controls.stepThree.controls.emplList.controls.push(
  //   this.fb.nonNullable.group({
  //     emplName: this.fb.nonNullable.control("", Validators.required),
  //     emplEmail: this.fb.nonNullable.control("", Validators.required)
  //   })
  // )

  // removeEmplList = (idx: number) => this.form.controls.stepThree.controls.emplList.removeAt(idx)

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
    compGroupCode: this.fb.nonNullable.control("", Validators.required),
    parentComp: this.fb.nonNullable.group<TMapForm<TComp>>({
      compName: this.fb.nonNullable.control("", Validators.required),
      compCode: this.fb.nonNullable.control("", Validators.required)
    }),
    shipTo: this.fb.nonNullable.control("", Validators.required),
    orderRemark: this.fb.nonNullable.control("", Validators.required),
    // emplList: this.emplListForm,
    payment: this.paymentForm,
    tax: this.fb.nonNullable.group({
      vatRegistered: this.fb.nonNullable.control(false),
      billIncludeVat: this.fb.nonNullable.control(false),
      fixedPrice: this.fb.nonNullable.control(false)
    })
  })

  private returnForm: TReturnForm = this.fb.nonNullable.group({
    before: this.fb.nonNullable.control(0),
    after: this.fb.nonNullable.control(0),
    whole: this.fb.nonNullable.control(false),
    lot: this.fb.nonNullable.control(false),
  })

  private condiForm: TCondiForm = this.fb.nonNullable.group({})

  addCondi = (key: 'sup' | 'stk') => () => {
    const f: TReturnForm = this.fb.nonNullable.group({
      before: this.fb.nonNullable.control(0, Validators.required),
      after: this.fb.nonNullable.control(0, Validators.required),
      whole: this.fb.nonNullable.control(false, Validators.required),
      lot: this.fb.nonNullable.control(false, Validators.required),
    })

    this.form.controls.condi.addControl(key, f)
  }

  removeCondi = (key: 'sup' | 'stk') => () => {
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
    const sup = this.form.controls.condi.get('stk') as TReturnForm | undefined

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


  get DNReq(): Omit<TDNCreate, 'compCode'> {
    const { auth, general, stepThree, condi } = this.form.getRawValue()
    return {
      compName: general.compName,
      compName2: general.compName2,
      compAddr: general.compAddr,
      compFax: general.compFax,
      compEmail: general.compEmail,
      compPhone: general.compPhone,
      compGroupCode: stepThree.compGroupCode,
      parentCompCode: stepThree.parentComp.compCode,
      orderRemark: stepThree.orderRemark,
      compStat: '1',
      paymentTerms: stepThree.payment.paymentTerms,
      tradePerDisc: stepThree.payment.tradePerDisc,
      dcPerDisc: stepThree.payment.dcPerDisc,
      cashPerDisc: stepThree.payment.cashPerDisc,
      billIncludeVAT: stepThree.tax.billIncludeVat ? '1' : '0',
      orderFileType: '', // '' for dn
      timeStamp: null,
      updateDate: null,
      sapUpdateDate: null,
      ...auth,
    }
  }

  get HUReq(): Omit<THUCreate, 'compCode'> {
    const { auth, general, stepThree, condi: { sup, stk } } = this.form.getRawValue()
    const supReturn = sup ? '1' : '0'
    const supFullBox = sup?.lot ? '1' : '0'
    const supSameLot = sup?.lot ? '1' : '0'
    const supMonthBeforeExp = sup?.before ?? 0
    const supMonthAfterExp = sup?.after ?? 0
    const stkReturn = stk ? '1' : '0'
    const stkFullBox = stk?.lot ? '1' : '0'
    const stkSameLot = stk?.lot ? '1' : '0'
    const stkMonthBeforeExp = stk?.before ?? 0
    const stkMonthAfterExp = stk?.after ?? 0
    return {
      compName: general.compName,
      compName2: general.compName2,
      compAddr: general.compAddr,
      compFax: general.compFax,
      compEmail: general.compEmail,
      compPhone: general.compPhone,
      compGroupCode: stepThree.compGroupCode,
      parentCompCode: stepThree.parentComp.compCode,
      orderRemark: stepThree.orderRemark,
      compStat: '1',
      paymentTerms: stepThree.payment.paymentTerms,
      tradePerDisc: stepThree.payment.tradePerDisc,
      dcPerDisc: stepThree.payment.dcPerDisc,
      cashPerDisc: stepThree.payment.cashPerDisc,
      billIncludeVAT: stepThree.tax.billIncludeVat ? '1' : '0',
      orderFileType: 'Pdf', // '' for dn
      timeStamp: null,
      updateDate: null,
      sapUpdateDate: null,
      // same as dn
      fixedPrice: stepThree.tax.fixedPrice ? '1' : '0',
      registered: stepThree.tax.vatRegistered ? '1' : '0',
      shipTo: stepThree.shipTo,
      saleName: general.contact.flatMap(c => c.emplName !== "" ? [`${c.emplName} /${c.emplPhone} /${c.emplEmail} `] : []).join('|'),
      supReturn, supFullBox, supSameLot, supMonthBeforeExp, supMonthAfterExp,
      stkReturn, stkFullBox, stkSameLot, stkMonthBeforeExp, stkMonthAfterExp,
      ...auth,
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

type TComp = { compName: string, compCode: string }

type TCompForm = FormGroup<TMapForm<TComp>>

type TGeneralForm = FormGroup<{
  compName: FormControl<string>
  compName2: FormControl<string>
  compAddr: FormControl<string>
  contact: FormArray<TContacListForm>
  compPhone: FormControl<string>
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
  vatRegistered: boolean
  billIncludeVat: boolean
  fixedPrice: boolean
}>>

type TStep3Form = FormGroup<{
  compGroupCode: FormControl<string>
  parentComp: TCompForm
  orderRemark: FormControl<string>
  shipTo: FormControl<string>
  // emplList: TEmplListForm
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
  stk?: TReturnForm
}>

export type TForm = FormGroup<{
  auth: TAuthForm
  general: TGeneralForm
  stepThree: TStep3Form
  condi: TCondiForm
}>


type TFormState = {
  compCode: string;
  compName: string;
  compAddr: string;
  compPhone: string;
  compFax: string;
  compEmail: string;
  compGroupCode: string;
  orderRemark: string;
  orderFileType: string | null; // pdf ???
  compName2: string;
  compStat: string; // '1'
  paymentTerms: number;
  timeStamp: string | null; // ISO date string
  updateDate: string | null; // ISO date string
  sapUpdateDate: string | null; // ISO date string
  parentCompCode: string;
  billIncludeVAT: boolean;
  cashPerDisc: number;
  tradePerDisc: number;
  dcPerDisc: number;
  username: string;
  userpass: string;
  // saleName: string;
  shipTo: string;
  fixedPrice: boolean;
  registered: boolean;
  supReturn: boolean;
  stkReturn: boolean;
  supFullBox: boolean;
  stkFullBox: boolean;
  supSameLot: boolean;
  stkSameLot: boolean;
  supMonthBeforeExp: number;
  stkMonthBeforeExp: number;
  supMonthAfterExp: number;
  stkMonthAfterExp: number;
}

type TEmplState = {
  emplName: string
  emplPhone: string
  emplEmail: string
}


type TIbAppItem = {
  goodCode: string;
  goodName: string;
  barCode: string
  goodStat: boolean;
  isShipTo: boolean;
  supReturn: boolean;
  supMonthBeforeExp: number;
  supMonthAfterExp: number;
  supFullBox: boolean;
  supSameLot: boolean;
  stkReturn: boolean;
  stkFullBox: boolean;
  stkSameLot: boolean;
  stkMonthBeforeExp: number;
  stkMonthAfterExp: number;
}