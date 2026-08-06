import { computed, Injectable, signal } from '@angular/core';
import { apply, applyEach, applyWhen, disabled, form, min, minLength, readonly, required, schema, validate } from '@angular/forms/signals';
import { CnLoadError, TReadonlyForm, TStepOne, TGoodFormItem, TCreateCancelForm } from '../types/cn.type';
import { mapRemarkToResult } from '../libs/remark-result';
import { mapRemarkToShowCN } from '../libs/remark-cn';


type RemarkCategory = {
  id: number,
  label: string,
}

const REMARK_CATEGORIES: RemarkCategory[] = [
  { id: 1, label: 'เกิดจากคลัง' },
  { id: 2, label: 'เกิดจากสินค้า' },
  { id: 3, label: 'สินค้าชำรุด' },
  { id: 4, label: 'เกิดจากลูกค้า' },
  { id: 5, label: 'เกิดจากเทเล' },
  { id: 6, label: 'เกิดจากเซล' },
  { id: 7, label: 'โอนเงินล่วงหน้า' },
];
@Injectable({
  providedIn: null,
})
export class CnStateService {
  loadError = signal<CnLoadError | null>(null)

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
      resultMustReject: null,
      cnType: null,
      remark: '',
      cnCount: 0,
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
    required(schema.resultMustReject, {
      message: 'กรุณาเลือกเพิ่มเติม',
      when: ({ valueOf }) => mapRemarkToResult(valueOf(schema.remarkOpt)) === 'mustReject'
    })
    required(schema.cnType, {
      message: 'กรุณาเลือกประเภทการ CN',
      when: ({ valueOf }) => mapRemarkToShowCN(valueOf(schema.remarkOpt))
    })
  })

  goodItemSchema = schema<TGoodFormItem>((schema) => {
    applyWhen(schema.amount, ({ valueOf }) => valueOf(schema.check), (s) => {
      min(s, 1, { message: 'ระบุจำนวนขั้นต่ำ 1 ชิ้น' })
    })
    // min(schema.amount, 1, { message: 'ต้องระบุจำนวนสินค้าอย่างน้อย 1 ชิ้น' })
    validate(schema.amount, ({ value, valueOf }) => {
      if (!valueOf(schema.check)) return null
      const amount = value()
      const { goodAmou, useItem } = valueOf(schema.good)
      const remaining = goodAmou - useItem
      if (goodAmou !== 0) {
        const message = useItem > 0
          ? `สั่งสินค้า ${goodAmou} ชิ้น cn ไปแล้ว ${useItem} จำนวนสูงสุดที่คืนได้คือ ${remaining}`
          : `cn ได้ไม่เกินจำนวนที่สั่ง ${goodAmou} ชิ้น`
        if (amount > remaining) return {
          kind: 'invalid amount',
          message
        }
      }
      return null
    })
    disabled(schema.check, ({ valueOf }) => {
      const { useItem, goodAmou: orderAmount } = valueOf(schema.good)
      return orderAmount - useItem <= 0 && (orderAmount !== 0 && useItem !== 0)
    })
  })

  requestCNForm = form<TCreateCancelForm>(this.formState, (schema) => {
    apply(schema.metadata, this.metaDataSchema)
    apply(schema.stepOne, this.stepOneSchema)
    validate(schema.stepOne.cusStat, ({ value, valueOf }) => {
      const stat = value()
      const bankAccount = valueOf(schema.metadata.bankNumb)
      if (bankAccount !== '') return null
      if (stat === '0') return null
      return {
        kind: 'invalid stat',
        message: 'ไม่สามารถโอนเงินได้เพราะไม่พบบัญชีโอนคืน'
      }
    })
    applyEach(schema.returnList, this.goodItemSchema)
    validate(schema.returnList, ({ value, valueOf }) => {
      const { cnType, remarkOpt } = valueOf(schema.stepOne);
      const remarkHash = mapRemarkToShowCN(remarkOpt)
      if (!remarkHash || cnType !== 'some') return null
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
