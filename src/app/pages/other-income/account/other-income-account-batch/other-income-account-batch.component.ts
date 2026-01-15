import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { NgbAlertModule, NgbProgressbarModule } from '@ng-bootstrap/ng-bootstrap';
import { TBatchResult } from '../../../../service/other-income/period.service';
import { BatchExcelService, TPreviewRow } from '../../../../service/other-income/batch-excel.service';
import {
  BatchStrategyRegistry,
  BatchType,
  IBatchStrategy
} from '../../../../service/other-income/batch';

type TUploadState = 'initial' | 'parsed' | 'processing' | 'complete';

@Component({
  selector: 'app-other-income-account-batch',
  imports: [FormsModule, DecimalPipe, NgbAlertModule, NgbProgressbarModule],
  templateUrl: './other-income-account-batch.component.html',
  styleUrl: './other-income-account-batch.component.scss',
  providers: [BatchExcelService]
})
export class OtherIncomeAccountBatchComponent {
  private readonly strategyRegistry = inject(BatchStrategyRegistry);
  private readonly batchExcelService = inject(BatchExcelService);

  // State
  uploadState = signal<TUploadState>('initial');
  batchType = signal<BatchType>('invoice');
  previewData = signal<TPreviewRow[]>([]);
  fileName = signal<string>('');

  // Processing state
  isProcessing = signal(false);
  progressPercent = signal(0);

  // Result state
  result = signal<TBatchResult | null>(null);
  errorMessage = signal<string>('');

  // Strategy-derived computed values
  currentStrategy = computed<IBatchStrategy>(() =>
    this.strategyRegistry.getStrategy(this.batchType())
  );

  columnHeader = computed(() => this.currentStrategy().config.columnHeaders);
  batchTypeLabel = computed(() => this.currentStrategy().config.label);

  // Computed
  validRows = computed(() => this.previewData().filter(r => r.valid));
  invalidRows = computed(() => this.previewData().filter(r => !r.valid));
  hasValidData = computed(() => this.invalidRows().length === 0);

  async onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    this.fileName.set(file.name);
    this.errorMessage.set('');

    const result = await this.batchExcelService.parseExcelFile(file);

    if (result.success) {
      this.previewData.set(result.data);
      this.uploadState.set('parsed');
    } else {
      this.errorMessage.set(result.error);
    }
  }

  onBatchTypeChange() {
    this.reset();
  }

  reset() {
    this.uploadState.set('initial');
    this.previewData.set([]);
    this.fileName.set('');
    this.result.set(null);
    this.errorMessage.set('');
    this.progressPercent.set(0);
  }

  /**
   * Submit using the Strategy Pattern - no if-else branching!
   */
  onSubmit() {
    const validData = this.validRows();
    if (validData.length === 0) return;

    this.isProcessing.set(true);
    this.uploadState.set('processing');
    this.progressPercent.set(10);

    // Get current strategy and delegate all type-specific logic
    const strategy = this.currentStrategy();
    const payload = strategy.mapToPayload(validData);

    strategy.executeBatch(payload).subscribe({
      next: (res) => this.handleSuccess(res),
      error: (err) => this.handleError(err)
    });
  }

  private handleSuccess(res: TBatchResult) {
    this.progressPercent.set(100);
    this.result.set(res);
    this.isProcessing.set(false);
    this.uploadState.set('complete');
  }

  private handleError(err: any) {
    this.isProcessing.set(false);
    this.uploadState.set('parsed');
    this.errorMessage.set(err?.error?.message ?? err?.message ?? 'เกิดข้อผิดพลาดในการอัพโหลด');
  }

  downloadTemplate() {
    this.batchExcelService.downloadTemplate(this.batchType());
  }

  downloadErrorReport() {
    const errors = this.result()?.errors ?? [];
    this.batchExcelService.downloadErrorReport(errors);
  }
}
