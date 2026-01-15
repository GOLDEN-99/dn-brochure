import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TPeriodCreditBatch, TBatchResult } from '../../period.service';
import { TPreviewRow } from '../../batch-excel.service';
import { BaseBatchStrategy } from './base-batch.strategy';
import { IBatchTypeConfig } from '../batch-strategy.interface';

@Injectable({ providedIn: 'root' })
export class CreditBatchStrategy extends BaseBatchStrategy<TPeriodCreditBatch> {
  readonly config: IBatchTypeConfig = {
    type: 'credit',
    label: 'ใบลดหนี้',
    columnHeaders: [
      { key: 'periodId', value: 'Period ID' },
      { key: 'numb', value: 'เลขที่ใบลดหนี้' },
      { key: 'date', value: 'วันที่ใบลดหนี้' },
      { key: 'amount', value: 'ยอด' },
      { key: 'remark', value: 'หมายเหตุ' }
    ]
  };

  protected mapRow(row: TPreviewRow): TPeriodCreditBatch {
    return {
      periodId: row.periodId,
      creditNumb: row.numb,
      creditDate: row.date,
      creditAmount: row.amount,
      creditRemark: row.remark
    };
  }

  executeBatch(payload: TPeriodCreditBatch[]): Observable<TBatchResult> {
    return this.periodService.batchCredit(payload);
  }
}
