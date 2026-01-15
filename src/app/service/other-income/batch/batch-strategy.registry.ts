import { Injectable, inject, Injector, Type } from '@angular/core';
import { IBatchStrategy, BatchType, TBatchPayload } from './batch-strategy.interface';
import { InvoiceBatchStrategy, ReceiptBatchStrategy, CreditBatchStrategy } from './strategies';

/**
 * Registry configuration mapping batch types to their strategy classes
 */
const STRATEGY_MAP: Record<BatchType, Type<IBatchStrategy<TBatchPayload>>> = {
  invoice: InvoiceBatchStrategy,
  receipt: ReceiptBatchStrategy,
  credit: CreditBatchStrategy
};

/**
 * Registry service for batch strategies
 * Uses lazy instantiation and caching for performance
 */
@Injectable({
  providedIn: 'root'
})
export class BatchStrategyRegistry {
  private readonly injector = inject(Injector);
  private readonly cache = new Map<BatchType, IBatchStrategy>();

  /**
   * Get strategy instance for the given batch type
   * Strategies are cached after first instantiation
   */
  getStrategy(type: BatchType): IBatchStrategy {
    if (!this.cache.has(type)) {
      const strategyClass = STRATEGY_MAP[type];
      if (!strategyClass) {
        throw new Error(`Unknown batch type: ${type}`);
      }
      const instance = this.injector.get(strategyClass);
      this.cache.set(type, instance);
    }
    return this.cache.get(type)!;
  }

  /**
   * Get all available batch types
   */
  getAvailableTypes(): BatchType[] {
    return Object.keys(STRATEGY_MAP) as BatchType[];
  }

  /**
   * Check if a batch type is registered
   */
  hasStrategy(type: string): type is BatchType {
    return type in STRATEGY_MAP;
  }
}
