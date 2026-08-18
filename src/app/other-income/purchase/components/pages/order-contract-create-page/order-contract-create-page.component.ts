import { Component, computed, effect, inject, signal } from '@angular/core';
import { form, FormField } from '@angular/forms/signals';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastService } from '../../../../../service/toast/toast.service';
import { OtherIncomePurchaseApiService } from '../../../services/other-income-purchase-api.service';
import { ProductConditionFormComponent } from '../../forms/product-condition-form/product-condition-form.component';
import { StepFormComponent } from '../../forms/step-form/step-form.component';
import { CreateSingleHeadComponent } from '../../forms/create-single-head/create-single-head.component';
import { CreateSingleCompComponent } from '../../forms/create-single-comp/create-single-comp.component';
import { OtherIncomeIncomeSelectComponent } from '../../../../shared/components/other-income-income-select/other-income-income-select.component';
import {
  TCreateOrderContractForm,
  createOrderContractSchema,
  mapOrderContractFormToCreateReq,
} from '../../forms/create-schema';

const today = new Date()
const todayStruct = { year: today.getFullYear(), month: today.getMonth() + 1, day: today.getDate() }

const initialFormData: TCreateOrderContractForm = {
  head: {
    settlementPeriod: null,
    contractLabel: null,
    dateRange: { startDate: todayStruct, endDate: todayStruct },
    bill: null, freeItem: null, invoice: null, creditNote: null,
  },
  comp: {
    compType: 'DN',
    dnComp: { comp: { compCode: '', compName: '', compName2: '' }, products: [] },
    huComp: { comp: { compCode: '', compName: '', compName2: '' }, products: [] },
  },
  excludeFlags: {
    excludeDc: false,
    excludeRebate: false,
    excludeComp: false,
    excludeInce: false,
    excludeVat: false,
  },
  calcSpec: {
    calcType: 'Flat',
    cap: { isCap: false, capAmount: 0 },
    bracketSteps: [],
    singleStep: { min: 0, rate: 0 },
  },
}

@Component({
  selector: 'app-order-contract-create-page',
  imports: [
    ProductConditionFormComponent,
    StepFormComponent,
    CreateSingleHeadComponent,
    CreateSingleCompComponent,
    FormField,
    OtherIncomeIncomeSelectComponent,
  ],
  templateUrl: './order-contract-create-page.component.html',
  styleUrl: './order-contract-create-page.component.scss',
})
export class OrderContractCreatePageComponent {
  private readonly api = inject(OtherIncomePurchaseApiService)
  private readonly router = inject(Router)
  private readonly route = inject(ActivatedRoute)
  private readonly toast = inject(ToastService)

  formData = signal<TCreateOrderContractForm>({ ...initialFormData })
  createContractForm = form(this.formData, createOrderContractSchema)

  cannotSubmit = computed(() => this.createContractForm().invalid())

  onSubmit() {
    try {
      const req = mapOrderContractFormToCreateReq(this.formData())
      this.api.createOrderContract(req).subscribe({
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
