import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TCreatePromotionRequest, TPromotionDetail } from '../../../types/crm-promotion.type';
import { CrmPromotionService } from '../../../service/crm-promotion/crm-promotion.service';
import { ToastService } from '../../../service/toast/toast.service';
import { CRM_PAGE_CONFIG } from '../../../service/crm-promotion/crm-token';
import { provideEditPromotionConfig } from '../../../factory/crm-promotion/create-promotion';
import { PromotionFormComponent } from '../../../components/crm-promotion/promotion-form/promotion-form.component';

@Component({
  selector: 'app-edit-promotion',
  imports: [PromotionFormComponent, RouterLink],
  providers: [
    {
      provide: CRM_PAGE_CONFIG,
      useFactory: () => {
        const detail = inject(ActivatedRoute).snapshot.data['detail'] as TPromotionDetail;
        return provideEditPromotionConfig(detail);
      },
    },
  ],
  template: `
    <app-promotion-form
      submitLabel="บันทึกการแก้ไข"
      [submitting]="submitting()"
      (submitted)="onSubmit($event)"
    >
      <div slot="header" class="d-flex align-items-center gap-2 mb-3">
        <a class="btn btn-sm btn-outline-secondary" [routerLink]="['/crm-promotion', id()]">
          <i class="bi bi-arrow-left"></i> กลับ
        </a>
        <h1 class="m-0">แก้ไขโปรโมชั่น</h1>
      </div>
    </app-promotion-form>
  `,
})
export class EditPromotionComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly promotionService = inject(CrmPromotionService);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);

  id = signal(Number(this.route.snapshot.paramMap.get('id')));
  submitting = signal(false);

  onSubmit(req: TCreatePromotionRequest) {
    this.submitting.set(true);
    this.promotionService.updatePromotion(this.id(), req).subscribe({
      next: () => {
        this.toastService.success('แก้ไขโปรโมชั่นสำเร็จ');
        this.promotionService.refetchPromotions();
        this.router.navigate(['/crm-promotion', this.id()]);
      },
      error: () => {
        this.toastService.danger('เกิดข้อผิดพลาดในการแก้ไขโปรโมชั่น');
        this.submitting.set(false);
      },
    });
  }
}
