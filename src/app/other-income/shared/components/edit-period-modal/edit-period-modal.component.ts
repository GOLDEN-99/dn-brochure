import { Component, computed, inject, input, model, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../../shared/services/api.service';
import { environment } from '../../../../../environments/environment';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-edit-period-modal',
  imports: [FormsModule],
  template: `
    <div class="modal-header">
      <h5 class="modal-title">แก้ไข Period</h5>
      <button type="button" class="btn-close" (click)="close.emit()"></button>
    </div>
    <div class="modal-body">
      <div class="mb-3">
        <label class="form-label">ชื่อ Period</label>
        <input
          type="text"
          class="form-control"
          [(ngModel)]="initialPeriodName"
          [disabled]="loading()"
        />
      </div>
      <div class="mb-3">
        <label class="form-label">หมายเหตุ</label>
        <textarea
          class="form-control"
          rows="3"
          [(ngModel)]="initialPeriodRemark"
          [disabled]="loading()"
        ></textarea>
      </div>
      @if(errorMessage()) {
        <div class="alert alert-danger">{{ errorMessage() }}</div>
      }
    </div>
    <div class="modal-footer">
      <button
        type="button"
        class="btn btn-secondary"
        (click)="close.emit()"
        [disabled]="loading()"
      >
        ยกเลิก
      </button>
      <button
        type="button"
        class="btn btn-primary"
        (click)="onSave()"
        [disabled]="disabled() || loading()"
      >
        @if(loading()) {
          <span class="spinner-border spinner-border-sm me-2"></span>
        }
        บันทึก
      </button>
    </div>
  `,
  styles: ''
})
export class EditPeriodModalComponent {
  periodId = input.required<number>();
  initialPeriodName = model("");
  initialPeriodRemark = model("");

  success = output<string>();
  fail = output<string>();
  close = output<void>();

  loading = signal(false);
  errorMessage = signal('');

  private api = inject(ApiService);
  private url = environment.oi;

  invalidPeriodName = computed(() => {
    const name = this.initialPeriodName().trim();
    return name === '';
  });

  disabled = computed(() => this.invalidPeriodName());



  async onSave() {
    if (this.disabled() || this.loading()) return;

    this.loading.set(true);
    this.errorMessage.set('');

    try {
      const body = {
        periodName: this.initialPeriodName().trim(),
        periodRemark: this.initialPeriodRemark().trim()
      };

      const res = await firstValueFrom(
        this.api.put<{ affectedRows: number }>(
          `${this.url}/period/${this.periodId()}`,
          body
        )
      );

      if (res.affectedRows > 0) {
        this.success.emit('แก้ไข Period สำเร็จ');
      } else {
        this.fail.emit('ไม่พบข้อมูล Period');
      }
    } catch (error: any) {
      const message = error?.error?.message || 'เกิดข้อผิดพลาดในการแก้ไข Period';
      this.errorMessage.set(message);
      this.fail.emit(message);
    } finally {
      this.loading.set(false);
    }
  }
}
