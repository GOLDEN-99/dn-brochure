import { Component, computed, inject, signal } from '@angular/core';
import { NgbCalendar, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { OtherIncomeNotLightPairService } from '../../../services/other-income-not-light-pair.service';
import { form, FormField } from '@angular/forms/signals';
import { StepFormComponent } from "../../forms/step-form/step-form.component";
import { OtherIncomeIncomeSelectComponent } from "../../../../shared/components/other-income-income-select/other-income-income-select.component";
import { JsonPipe } from '@angular/common';
import { CreatePairCompanyPickerComponent } from "../../forms/create-pair-company-picker/create-pair-company-picker.component";
import { CreatePairHeadComponent } from "../../forms/create-pair-head/create-pair-head.component";
import { CreatePairProductPickerComponent } from "../../forms/create-pair-product-picker/create-pair-product-picker.component";
import { ProductConditionFormComponent } from "../../forms/product-condition-form/product-condition-form.component";
import { createPairedOrderContractSchema, TCreatePairedOrderContractForm } from '../../forms/create-schema';

@Component({
  selector: 'app-create-paired-order-contract',
  imports: [FormField, JsonPipe, StepFormComponent, OtherIncomeIncomeSelectComponent, CreatePairCompanyPickerComponent, CreatePairHeadComponent, CreatePairProductPickerComponent, ProductConditionFormComponent],
  templateUrl: './create-paired-order-contract.component.html',
  styles: '',
})
export class CreatePairedOrderContractComponent {
  private readonly calendarService = inject(NgbCalendar)
  startOfYear: NgbDateStruct = {
    ...this.calendarService.getToday(), day: 1, month: 1
  }
  endOfYear: NgbDateStruct = {
    ...this.calendarService.getToday(), day: 31, month: 12
  }
  formData = signal<TCreatePairedOrderContractForm>({
    head: {
      settlementPeriod: null,
      contractLabel: null,
      bill: null, freeItem: null, invoice: null, creditNote: null,
      dateRange: {
        startDate: this.startOfYear,
        endDate: this.endOfYear
      }
    },
    products: [],
    comps: {
      dnComp: { compCode: '', compName: '', compName2: '' },
      huComp: { compCode: '', compName: '', compName2: '' }
    },
    excludeFlags: {
      excludeDc: false, excludeRebate: false, excludeComp: false, excludeInce: false, excludeVat: false
    },
    calcSpec: {
      cap: {
        isCap: false,
        capAmount: 0
      },
      calcType: null,
      bracketSteps: [
        { min: 0, rate: 0 }
      ],
      singleStep: { min: 0, rate: 0 }
    }
  })
  private readonly otherIncomeDual = inject(OtherIncomeNotLightPairService)
  private readonly pairList = this.otherIncomeDual.pairList
  private readonly schema = computed(() => {
    const pair = this.pairList()
      .map(({ displayName }: { displayName: string }) => displayName.toLocaleLowerCase().trim())
    return createPairedOrderContractSchema(pair);
  })

  createForm = form<TCreatePairedOrderContractForm>(this.formData, this.schema())
}
