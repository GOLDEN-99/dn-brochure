import { Component, computed, inject, signal } from '@angular/core';
import { createPromoContractSchema, mapPromoContractFormToCreateReq, TCreatePromoContractForm } from '../../forms/create-schema';
import { form, FormField } from '@angular/forms/signals';
import { CreateSingleHeadComponent } from "../../forms/create-single-head/create-single-head.component";
import { OtherIncomeIncomeSelectComponent } from "../../../../shared/components/other-income-income-select/other-income-income-select.component";
import { OtherIncomePurchaseApiService } from '../../../services/other-income-purchase-api.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from '../../../../../service/toast/toast.service';
import { CreateSingleCompWithoutProductComponent } from "../../forms/create-single-comp-without-product/create-single-comp-without-product.component";

const today = new Date()
const todayStruct = { year: today.getFullYear(), month: today.getMonth() + 1, day: today.getDate() }

const initialFormData: TCreatePromoContractForm = {
  head: {
    settlementPeriod: null,
    contractLabel: null,
    dateRange: { startDate: todayStruct, endDate: todayStruct },
    bill: null, freeItem: null, invoice: null, creditNote: null,
  },
  comp: {
    compType: 'DN',
    dnComp: { compCode: '', compName: '', compName2: '' },
    huComp: { compCode: '', compName: '', compName2: '' },
  },

}

@Component({
  selector: 'app-promo-contract-create-page',
  imports: [CreateSingleHeadComponent, OtherIncomeIncomeSelectComponent, FormField, CreateSingleCompWithoutProductComponent],
  templateUrl: './promo-contract-create-page.component.html',
  styleUrl: './promo-contract-create-page.component.scss',
})
export class PromoContractCreatePageComponent {
  private readonly api = inject(OtherIncomePurchaseApiService)
  private readonly router = inject(Router)
  private readonly route = inject(ActivatedRoute)
  private readonly toast = inject(ToastService)

  formData = signal(initialFormData)
  createContractForm = form(this.formData, createPromoContractSchema)

  cannotSubmit = computed(() => this.createContractForm().invalid())

  onSubmit() {
    try {
      const req = mapPromoContractFormToCreateReq(this.formData())
      this.api.createPromoContract(req).subscribe({
        next: () => {
          this.toast.success('สร้างสัญญาสำเร็จ')
          this.router.navigate(['../'], { relativeTo: this.route })
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
