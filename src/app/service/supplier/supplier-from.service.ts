import { computed, inject, Injectable, signal } from '@angular/core';
import { TDNCreate, TEmplState, TFormState, THUCreate, TIbAppItem, TItem } from './shared.type';
@Injectable({
  providedIn: 'root'
})
export class SupplierFromService {

  constructor() { }

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
    compGroupDesc: '',
    parentCompCode: '',
    parentCompName: '',
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
  updateEmpl = <K extends keyof TEmplState>(key: K) => (value: TEmplState[K], index: number) =>
    this.emplList.update(prev => prev.map((p, i) => i === index ? ({ ...p, [key]: value }) : p))

  formState = signal(this.initialState)
  invalidFormState = computed(() => {
    const { compCode, username, userpass, compGroupCode, compName, compName2, compAddr, compPhone } = this.formState()
    const pattern = /^0[01]\d{4}$/;
    const invaliduser = !pattern.test(username)
    return compCode === '' || invaliduser || userpass === ''
      || compGroupCode === '' || compName === ''
      || compAddr === '' || compPhone === ''
      || compName2 === ''
  })
  updator = <K extends keyof TFormState>(key: K) =>
    (value: TFormState[K]) => this.formState
      .update(prev => ({ ...prev, [key]: value }))

  setCompCode = (compCode: string) => this.formState
    .update(prev => ({ ...prev, compCode }))

  resetForm = () => {
    this.formState.set(this.initialState)
    this.emplList.set([this.inintialEmpl])
    this.item.set([])
  }
  get DNReq(): Omit<TDNCreate, 'compCode'> {
    const base = this.formState()
    return {
      compName: base.compName,
      compName2: base.compName2,
      compAddr: base.compAddr,
      compFax: base.compFax,
      compEmail: base.compEmail,
      compPhone: base.compPhone,
      compGroupCode: base.compGroupCode,
      parentCompCode: base.parentCompCode,
      orderRemark: base.orderRemark,
      compStat: '1',
      paymentTerms: base.paymentTerms,
      tradePerDisc: base.tradePerDisc,
      dcPerDisc: base.dcPerDisc,
      cashPerDisc: base.cashPerDisc,
      billIncludeVAT: base.billIncludeVAT ? '1' : '0',
      orderFileType: '', // '' for dn
      timeStamp: null,
      updateDate: null,
      sapUpdateDate: null,
      username: base.username,
      userpass: base.userpass
    }
  }
  get DNItem(): TItem[] {
    const itemlist = this.item()
    return itemlist.map(({
      goodStat,
      ...res
    }) => ({
      ...res,
      goodStat: this.booleanAdapter(goodStat),
      isShipTo: '0',
      supReturn: '0',
      supFullBox: '0',
      supSameLot: '0',
      supMonthBeforeExp: '0',
      supMonthAfterExp: '0',
      stkReturn: '0',
      stkFullBox: '0',
      stkSameLot: '0',
      stkMonthBeforeExp: '0',
      stkMonthAfterExp: '0',
    }))
  }

  get HUItem(): TItem[] {
    const itemlist = this.item()
    return itemlist.map(({
      goodCode,
      goodStat,
      isShipTo,
      supReturn,
      supFullBox,
      supSameLot,
      supMonthBeforeExp,
      supMonthAfterExp,
      stkReturn,
      stkFullBox,
      stkSameLot,
      stkMonthBeforeExp,
      stkMonthAfterExp,
      ...res
    }) => ({
      ...res,
      goodCode,
      goodStat: this.booleanAdapter(goodStat),
      isShipTo: String(isShipTo),
      supReturn: this.booleanAdapter(supReturn),
      supFullBox: this.booleanAdapter(supFullBox),
      supSameLot: this.booleanAdapter(supSameLot),
      supMonthAfterExp: String(supMonthAfterExp),
      supMonthBeforeExp: String(supMonthAfterExp),
      stkReturn: this.booleanAdapter(stkReturn),
      stkFullBox: this.booleanAdapter(stkFullBox),
      stkSameLot: this.booleanAdapter(stkSameLot),
      stkMonthAfterExp: String(stkMonthAfterExp),
      stkMonthBeforeExp: String(stkMonthAfterExp),
    }))
  }
  private booleanAdapter = (value: boolean) => {
    switch (value) {
      case true: return '1'
      case false: return '0'
    }
  }
  get HUReq(): Omit<THUCreate, 'compCode'> {
    const base = this.formState()
    const emplList = this.emplList()
    const supReturn = base.stkReturn ? '1' : '0'
    const supFullBox = base.supFullBox ? '1' : '0'
    const supSameLot = base.supSameLot ? '1' : '0'
    const supMonthBeforeExp = base.supMonthAfterExp ?? 0
    const supMonthAfterExp = base.supMonthAfterExp ?? 0
    const stkReturn = base.stkReturn ? '1' : '0'
    const stkFullBox = base.stkFullBox ? '1' : '0'
    const stkSameLot = base.stkSameLot ? '1' : '0'
    const stkMonthBeforeExp = base.stkMonthBeforeExp ?? 0
    const stkMonthAfterExp = base.stkMonthAfterExp ?? 0
    return {
      compName: base.compName,
      compName2: base.compName2,
      compAddr: base.compAddr,
      compFax: base.compFax,
      compEmail: base.compEmail,
      compPhone: base.compPhone,
      compGroupCode: base.compGroupCode,
      parentCompCode: base.parentCompCode,
      orderRemark: base.orderRemark,
      compStat: '1',
      paymentTerms: base.paymentTerms,
      tradePerDisc: base.tradePerDisc,
      dcPerDisc: base.dcPerDisc,
      cashPerDisc: base.cashPerDisc,
      billIncludeVAT: base.billIncludeVAT ? '1' : '0',
      orderFileType: 'Pdf', // '' for dn
      timeStamp: null,
      updateDate: null,
      sapUpdateDate: null,
      // same as dn
      fixedPrice: base.fixedPrice ? '1' : '0',
      registered: base.registered ? '1' : '0',
      shipTo: base.shipTo,
      saleName: emplList.flatMap(c => c.emplName !== "" ? [`${c.emplName} /${c.emplPhone} /${c.emplEmail} `] : []).join('|'),
      supReturn, supFullBox, supSameLot, supMonthBeforeExp, supMonthAfterExp,
      stkReturn, stkFullBox, stkSameLot, stkMonthBeforeExp, stkMonthAfterExp,
      username: base.username,
      userpass: base.userpass
    }
  }

  disableSubmit = computed(() => this.item().length === 0 || this.invalidFormState())
}



