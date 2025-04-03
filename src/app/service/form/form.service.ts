import { inject, Injectable, signal } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ICnForm, TCnResult, TCnSpecialReason } from '../../types/cn.type';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { cnReasonRef } from '../../lib/cn/cnRef';

@Injectable({
  providedIn: 'root'
})
export class FormService {

  constructor() {
    this.baseForm.controls.transfer.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((trans) => this.isTransfer.update(() => trans == 0))

    this.baseForm.controls.reason.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(reason => this.possibleResult.update(() => this.provideResult(reason)))
  }

  private fb = inject(FormBuilder)

  baseForm = this.fb.group<ICnForm>({
    wholeCode: this.fb.nonNullable.control(""),
    wholeName: this.fb.nonNullable.control(""),
    ws: this.fb.nonNullable.control(""),
    transfer: this.fb.control<'0' | '1'>('1'),
    reason: this.fb.control<TCnSpecialReason>('คลังส่งขาด'),
    result: this.fb.control<TCnResult>('ลูกค้ารับ'),
    note: this.fb.control(""),
    cnType: this.fb.control(null)
  })

  possibleReason = signal([...cnReasonRef])

  private provideResult = (reason: TCnSpecialReason | null): TCnResult[] => {
    switch (reason) {
      case 'คลังส่งเกิน': return ['ลูกค้ารับ', 'ลูกค้าไม่รับ']
      case 'คลังส่งขาด': return ['ลูกค้ารับ', 'ลูกค้าไม่รับ']
      case 'คลังส่งผิด': return ['ลูกค้ารับ', 'ลูกค้าไม่รับ', 'ลูกค้ารับเปลี่ยน']
      case 'สินค้าชำรุด': return ['ลูกค้าไม่รับ', 'ลูกค้ารับเปลี่ยน']
      default: return []
    }
  }

  possibleResult = signal<TCnResult[]>([])

  isTransfer = signal(false)

}
