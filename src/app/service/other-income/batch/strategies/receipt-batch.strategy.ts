import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TPeriodReceBatch, TBatchResult } from '../../period.service';
import { TPreviewRow } from '../../batch-excel.service';
import { BaseBatchStrategy } from './base-batch.strategy';
import { IBatchTypeConfig } from '../batch-strategy.interface';

@Injectable({ providedIn: 'root' })
export class ReceiptBatchStrategy extends BaseBatchStrategy<TPeriodReceBatch> {
  readonly config: IBatchTypeConfig = {
    type: 'receipt',
    label: 'ใบเสร็จ',
    columnHeaders: [
      { key: 'periodId', value: 'Period ID' },
      { key: 'numb', value: 'เลขที่ใบเสร็จรับเงิน' },
      { key: 'date', value: 'วันที่ใบเสร็จรับเงิน' },
      { key: 'amount', value: 'ยอด' },
      { key: 'remark', value: 'หมายเหตุ' }
    ]
  };

  protected mapRow(row: TPreviewRow): TPeriodReceBatch {
    return {
      periodId: row.periodId,
      receNumb: row.numb,
      receDate: row.date,
      receAmount: row.amount,
      receRemark: row.remark
    };
  }

  executeBatch(payload: TPeriodReceBatch[]): Observable<TBatchResult> {
    return this.periodService.batchReceipt(payload);
  }
}
