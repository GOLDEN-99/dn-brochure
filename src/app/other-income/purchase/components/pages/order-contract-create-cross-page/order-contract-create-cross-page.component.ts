import { Component, computed, inject, viewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastService } from '../../../../../service/toast/toast.service';
import { OtherIncomePurchaseApiService } from '../../../services/other-income-purchase-api.service';
import { CreatePairedOrderContractComponent } from '../../features/create-paired-order-contract/create-paired-order-contract.component';
import { mapPairedOrderContractFormToCreateReq } from '../../forms/create-schema';

@Component({
  selector: 'app-order-contract-create-cross-page',
  imports: [CreatePairedOrderContractComponent],
  templateUrl: './order-contract-create-cross-page.component.html',
  styleUrl: './order-contract-create-cross-page.component.scss',
})
export class OrderContractCreateCrossPageComponent {
  private readonly api = inject(OtherIncomePurchaseApiService)
  private readonly router = inject(Router)
  private readonly route = inject(ActivatedRoute)
  private readonly toast = inject(ToastService)

  createPairedContract = viewChild.required(CreatePairedOrderContractComponent)

  cannotSubmit = computed(() => this.createPairedContract().createForm().invalid())

  onSubmit() {
    try {
      const req = mapPairedOrderContractFormToCreateReq(this.createPairedContract().formData())
      this.api.createPairedOrderContract(req).subscribe({
        next: () => {
          this.toast.success('สร้างสัญญาสำเร็จ')
          this.router.navigate(['../../'], { relativeTo: this.route })
        },
        error: (err) => {
          this.toast.danger(err?.message ?? 'เกิดข้อผิดพลาด')
        },
      })
    } catch (err) {
      this.toast.danger(err instanceof Error ? err.message : String(err))
    }
  }
}
