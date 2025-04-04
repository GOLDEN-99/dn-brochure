import { computed, inject, Injectable, signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ICnForm, TCnResult, TCnSpecialReason } from '../../types/cn.type';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { cnReasonRef, transferRef } from '../../lib/cn/cnRef';

@Injectable({
  providedIn: 'root'
})
export class FormService {

  constructor() { }

  private fb = inject(FormBuilder)

  baseForm = this.fb.group<ICnForm>({
    wholeCode: this.fb.nonNullable.control("", Validators.required),
    wholeName: this.fb.nonNullable.control("", Validators.required),
    ws: this.fb.nonNullable.control("", Validators.required),
    transfer: this.fb.control('ไม่โอนคืน', Validators.required),
    reason: this.fb.control('คลังส่งขาด', Validators.required),
    // result: this.fb.control('ลูกค้ารับ', Validators.required),
    note: this.fb.control(""),
    // cnType: this.fb.control(null, Validators.required)
  })

  possibleBank = signal([...transferRef])
  possibleReason = signal([...cnReasonRef])

  private provideResult = (reason: TCnSpecialReason | null | undefined): TCnResult[] => {
    switch (reason) {
      case 'คลังส่งเกิน': return ['ลูกค้ารับ', 'ลูกค้าไม่รับ']
      case 'คลังส่งขาด': return ['ลูกค้ารับ', 'ลูกค้าไม่รับ']
      case 'คลังส่งผิด': return ['ลูกค้ารับ', 'ลูกค้าไม่รับ', 'ลูกค้ารับเปลี่ยน']
      case 'สินค้าชำรุด': return ['ลูกค้าไม่รับ', 'ลูกค้ารับเปลี่ยน']
      default: return []
    }
  }

  private bankSignal = toSignal(this.baseForm.controls.transfer.valueChanges)
  private reasonSignal = toSignal(this.baseForm.controls.reason.valueChanges)
  private willNotShowResult(reason: unknown) {
    if (typeof reason !== 'string') return false
    return !['ลดผิด', 'โอนซ้ำ', 'โอนผิด'].includes(reason)
  }
  notShowResult = computed(() => this.willNotShowResult(this.reasonSignal()))
  possibleResult = computed<TCnResult[]>(() => this.provideResult(this.reasonSignal()))

  isTransfer = computed(() => this.bankSignal() === 'โอนคืน')
}
