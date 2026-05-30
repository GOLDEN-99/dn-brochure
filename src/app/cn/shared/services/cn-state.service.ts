import { computed, Injectable, signal } from '@angular/core';
import { apply, applyEach, form, minLength, readonly, required, schema, validate } from '@angular/forms/signals';
import { TReadonlyForm, TStepOne, TGoodFormItem, TCreateCancelForm } from '../types/cn.type';
import { mapRemarkToResult } from '../libs/remark-result';
import { mapRemarkToShowCN } from '../libs/remark-cn';

@Injectable({
  providedIn: null,
})
export class CnStateService {
  formState = signal<TCreateCancelForm>({
    metadata: {
      isWRR: '0',
      bankAcName: '',
      bankCode: '',
      bankNumb: '',
      code: '',
      name: '',
      wholeCode: '',
      wholeDate: '',
      wholeName: '',
      wholeNumb: '',
      saleCode: ''
    },
    stepOne: {
      remarkOpt: null,
      resultNotChange: null,
      resultAll: null,
      resultNotAccept: null,
      cnType: null,
      remark: '',
      cnCount: 10,
      cusStat: ''
    },
    returnList: [],
    image: [],
  })

  metaDataSchema = schema<TReadonlyForm>((schema) => {
    readonly(schema.isWRR)
    readonly(schema.bankAcName)
    readonly(schema.bankCode)
    readonly(schema.bankNumb)
    readonly(schema.code)
    readonly(schema.name)
    readonly(schema.wholeCode)
    readonly(schema.wholeDate)
    readonly(schema.wholeName)
    readonly(schema.wholeNumb)
    readonly(schema.saleCode)
  })

  stepOneSchema = schema<TStepOne>((schema) => {
    required(schema.cusStat)
    required(schema.remarkOpt, { message: 'กรุณาเลือกสาเหตุ' })
    required(schema.resultAll, {
      message: 'กรุณาเลือกเพิ่มเติม',
      when: ({ valueOf }) => mapRemarkToResult(valueOf(schema.remarkOpt)) === 'all'
    })
    required(schema.resultNotAccept, {
      message: 'กรุณาเลือกเพิ่มเติม',
      when: ({ valueOf }) => mapRemarkToResult(valueOf(schema.remarkOpt)) === 'notAccept'
    })
    required(schema.resultNotChange, {
      message: 'กรุณาเลือกเพิ่มเติม',
      when: ({ valueOf }) => mapRemarkToResult(valueOf(schema.remarkOpt)) === 'notChange'
    })
    required(schema.cnType, {
      message: 'กรุณาเลือกประเภทการ CN',
      when: ({ valueOf }) => mapRemarkToShowCN(valueOf(schema.remarkOpt))
    })
  })

  goodItemSchema = schema<TGoodFormItem>((schema) => {
    validate(schema.amount, ({ value, valueOf }) => {
      if (!valueOf(schema.check)) return null
      const amount = value()
      const orderAmount = valueOf(schema.good).orderAmount
      if (orderAmount !== 0) {
        if (amount > orderAmount) return { kind: 'invalid amount', message: `จำนวนสูงสุดที่คืนได้คือ ${orderAmount}` }
      }
      return null
    })
  })

  requestCNForm = form<TCreateCancelForm>(this.formState, (schema) => {
    apply(schema.metadata, this.metaDataSchema)
    apply(schema.stepOne, this.stepOneSchema)
    applyEach(schema.returnList, this.goodItemSchema)
    validate(schema.returnList, ({ value }) => {
      return value().some(({ check }) => check)
        ? null
        : {
          kind: 'invalid return list',
          message: 'เลือกสินค้าที่คืนอย่างน้อย 1 รายการ'
        }
    })
    minLength(schema.image, 1, { message: 'ต้องแนบรูปอย่างน้อย 1 รูป' })
    applyEach(schema.image, required)
  })

  resultType = computed(() => mapRemarkToResult(this.formState().stepOne.remarkOpt))
  showCN = computed(() => mapRemarkToShowCN(this.formState().stepOne.remarkOpt))

  checkCount = computed(() => this.formState().returnList
    .reduce((acc, { check }) => check ? acc + 1 : acc, 0)
  )

  totalPrice = computed(() => {
    const { stepOne: { cnType }, returnList } = this.formState();
    if (cnType === 'whole') return returnList.reduce((acc, cur) => acc + cur.good.subTotal, 0)
    return returnList.reduce((acc, { check, good, amount }) => check ? acc + (amount * good.unitPrice) : acc, 0)
  })

  endPoint = computed(() => {
    const { stepOne } = this.formState();
    const { cnType, remarkOpt } = stepOne
    const remarkHash = mapRemarkToShowCN(remarkOpt)
    if (remarkHash) return cnType
    return 'upload'
  })
}
