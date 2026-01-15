import { inject } from '@angular/core';
import { Observable } from 'rxjs';
import { PeriodService, TBatchResult } from '../../period.service';
import { TPreviewRow } from '../../batch-excel.service';
import { IBatchStrategy, IBatchTypeConfig, TBatchPayload } from '../batch-strategy.interface';

/**
 * Abstract base class for batch strategies
 * Provides common functionality and enforces contract
 */
export abstract class BaseBatchStrategy<TPayload extends TBatchPayload> implements IBatchStrategy<TPayload> {
  protected readonly periodService = inject(PeriodService);

  abstract readonly config: IBatchTypeConfig;

  /**
   * Maps a single preview row to payload item
   * Must be implemented by concrete strategies
   */
  protected abstract mapRow(row: TPreviewRow): TPayload;

  /**
   * Executes the API call for this batch type
   * Must be implemented by concrete strategies
   */
  abstract executeBatch(payload: TPayload[]): Observable<TBatchResult>;

  /**
   * Maps all valid preview rows to payload format
   */
  mapToPayload(rows: TPreviewRow[]): TPayload[] {
    return rows.map(row => this.mapRow(row));
  }
}
