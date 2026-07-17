import { Observable } from 'rxjs';
import { TBatchResult, TPeriodCreditBatch, TPeriodInvBatch, TPeriodReceBatch } from '../period.service';
import type { TColumnHeader, TPreviewRow } from '../batch-excel.service';

/**
 * Batch type discriminator
 */
export type BatchType = 'invoice' | 'receipt' | 'credit';

/**
 * Union type for all batch payload types
 */
export type TBatchPayload = TPeriodInvBatch | TPeriodReceBatch | TPeriodCreditBatch;

/**
 * Type mapping from BatchType to corresponding payload type
 */
export type TBatchPayloadMap = {
  invoice: TPeriodInvBatch;
  receipt: TPeriodReceBatch;
  credit: TPeriodCreditBatch;
};

/**
 * Generic type to get payload type from batch type
 */
export type PayloadFor<T extends BatchType> = TBatchPayloadMap[T];

/**
 * Configuration for a batch type
 */
export interface IBatchTypeConfig {
  readonly type: BatchType;
  readonly label: string;
  readonly columnHeaders: TColumnHeader[];
}

/**
 * Strategy interface for batch operations
 * Implements the Strategy Pattern for handling different batch types
 */
export interface IBatchStrategy<TPayload extends TBatchPayload = TBatchPayload> {
  readonly config: IBatchTypeConfig;

  /**
   * Maps preview row data to API payload format
   */
  mapToPayload(rows: TPreviewRow[]): TPayload[];

  /**
   * Executes the batch API call
   */
  executeBatch(payload: TPayload[]): Observable<TBatchResult>;
}

/**
 * Type guard to check if a value is a valid BatchType
 */
export function isBatchType(value: unknown): value is BatchType {
  return value === 'invoice' || value === 'receipt' || value === 'credit';
}
