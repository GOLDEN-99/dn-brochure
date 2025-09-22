import { Component, inject, input, Signal, signal } from '@angular/core';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { BaseSupplierForm } from '../../../lib/supplier/baseForm';
import { FormsModule } from '@angular/forms';
import { SupplierApiService } from '../../../service/supplier/supplier-api.service';


@Component({
  selector: 'app-condition-page',
  imports: [NgbNavModule, FormsModule],
  templateUrl: './condition-page.component.html',
  styleUrl: './condition-page.component.scss'
})
export class ConditionPageComponent extends BaseSupplierForm {
  readonly = input(false)
  active = signal(1)
  updator = this.formService.updator
  noSupReturn() {
    this.formState.update(prev => ({
      ...prev,
      supReturn: false,
      supFullBox: false,
      supSameLot: false,
      supMonthAfterExp: 0,
      supMonthBeforeExp: 0
    }))
  }
  noStkReturn() {
    this.formState.update(prev => ({
      ...prev,
      stkReturn: false,
      stkFullBox: false,
      stkSameLot: false,
      stkMonthAfterExp: 0,
      stkMonthBeforeExp: 0
    }))
  }
  private ibobApi = inject(SupplierApiService)
  compType = this.ibobApi.compType
}
