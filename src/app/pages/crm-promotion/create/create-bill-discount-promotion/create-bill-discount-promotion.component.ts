import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { NgbCalendar } from '@ng-bootstrap/ng-bootstrap';
import { TCreatePromotionRequest } from '../../../../types/crm-promotion.type';
import { CRM_PAGE_CONFIG } from '../../../../service/crm-promotion/crm-token';
import { CrmPromotionService } from '../../../../service/crm-promotion/crm-promotion.service';
import { ToastService } from '../../../../service/toast/toast.service';
import { PromotionFormComponent } from '../../../../components/crm-promotion/promotion-form/promotion-form.component';

@Component({
  selector: 'app-create-bill-discount-promotion',
  imports: [PromotionFormComponent],
  template: `
    <app-promotion-form
      submitLabel="สร้างโปรโมชั่น"
      [submitting]="submitting()"
      [initialData]="initialData"
      (submitted)="onSubmit($event)"
    >
      <div slot="header" class="d-flex align-items-center gap-2 mb-3">
        <h1 class="m-0">{{ pageName() }}</h1>
      </div>
    </app-promotion-form>
  `,
})
export class CreateBillDiscountPromotionComponent {
  private readonly calService = inject(NgbCalendar);
  private readonly config = inject(CRM_PAGE_CONFIG);
  private readonly promotionService = inject(CrmPromotionService);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);

  private readonly today = this.calService.getToday();

  pageName = signal(this.config.pageName);
  submitting = signal(false);

  readonly initialData = {
    ...this.config.initialData,
    promotionMaster: {
      ...this.config.initialData.promotionMaster,
      dateRange: { startDate: this.today, endDate: this.today },
    },
  };

  onSubmit(req: TCreatePromotionRequest) {
    this.submitting.set(true);
    this.promotionService.createPromotion(req).subscribe({
      next: () => {
        this.toastService.success('สร้างโปรโมชั่นสำเร็จ');
        this.promotionService.refetchPromotions();
        this.router.navigate(['/crm-promotion']);
      },
      error: () => {
        this.toastService.danger('เกิดข้อผิดพลาดในการสร้างโปรโมชั่น');
        this.submitting.set(false);
      },
    });
  }
}
