import { Component, computed, inject, signal } from '@angular/core';
import { CreateSingleHeadComponent } from "../../forms/create-single-head/create-single-head.component";
import { form, FormField } from "@angular/forms/signals";
import { CreateSingleCompWithoutProductComponent } from "../../forms/create-single-comp-without-product/create-single-comp-without-product.component";
import { OtherIncomeIncomeSelectComponent } from "../../../../shared/components/other-income-income-select/other-income-income-select.component";
import { OtherIncomePurchaseApiService } from '../../../services/other-income-purchase-api.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from '../../../../../service/toast/toast.service';
import { createBranchContractSchema, mapBranchContractFormToCreateReq, TCreateBranchContractForm } from '../../forms/create-schema';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';


const today = new Date()
const todayStruct = { year: today.getFullYear(), month: today.getMonth() + 1, day: today.getDate() }

const initialFormData: TCreateBranchContractForm = {
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
  branchSpec: {
    maxBranches: 0,
    maxIncome: 0
  }

}

@Component({
  selector: 'app-branch-contract-create-page',
  imports: [CreateSingleHeadComponent, FormField, CreateSingleCompWithoutProductComponent, OtherIncomeIncomeSelectComponent, FormsModule, DecimalPipe],
  templateUrl: './branch-contract-create-page.component.html',
  styleUrl: './branch-contract-create-page.component.scss',
})
export class BranchContractCreatePageComponent {
  private readonly api = inject(OtherIncomePurchaseApiService)
  private readonly router = inject(Router)
  private readonly route = inject(ActivatedRoute)
  private readonly toast = inject(ToastService)

  formData = signal(initialFormData)
  createContractForm = form(this.formData, createBranchContractSchema)

  maxRate = computed(() => {
    const { maxBranches, maxIncome } = this.formData().branchSpec
    if (maxBranches === 0) return 0
    return maxIncome / maxBranches
  })

  monthRate = computed(() => this.maxRate() / 12)

  cannotSubmit = computed(() => this.createContractForm().invalid())

  onSubmit() {
    try {
      const req = mapBranchContractFormToCreateReq(this.formData())
      this.api.createBranchContract(req).subscribe({
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
