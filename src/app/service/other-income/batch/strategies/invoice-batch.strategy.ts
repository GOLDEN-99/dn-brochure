import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TPeriodInvBatch, TBatchResult } from '../../period.service';
import { TPreviewRow } from '../../batch-excel.service';
import { BaseBatchStrategy } from './base-batch.strategy';
import { IBatchTypeConfig } from '../batch-strategy.interface';

@Injectable({ providedIn: 'root' })
export class InvoiceBatchStrategy extends BaseBatchStrategy<TPeriodInvBatch> {
  readonly config: IBatchTypeConfig = {
    type: 'invoice',
    label: 'ใบแจ้งหนี้',
    columnHeaders: [
      { key: 'periodId', value: 'Period ID' },
      { key: 'numb', value: 'เลขที่ใบแจ้งหนี้' },
      { key: 'date', value: 'วันที่ใบแจ้งหนี้' },
      { key: 'amount', value: 'ยอด' },
      { key: 'remark', value: 'หมายเหตุ' }
    ]
  };

  protected mapRow(row: TPreviewRow): TPeriodInvBatch {
    return {
      periodId: row.periodId,
      invNumb: row.numb,
      invDate: row.date,
      invAmount: row.amount,
      invRemark: row.remark
    };
  }

  executeBatch(payload: TPeriodInvBatch[]): Observable<TBatchResult> {
    return this.periodService.batchInvoice(payload);
  }
}
