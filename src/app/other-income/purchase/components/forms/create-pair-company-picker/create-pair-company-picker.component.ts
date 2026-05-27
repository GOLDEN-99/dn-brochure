import { Component, computed, ElementRef, inject, input, InputSignal, InputSignalWithTransform, model, ModelSignal, signal, viewChild, ViewChild } from '@angular/core';
import { FormValueControl, ValidationError } from '@angular/forms/signals';
import { OtherIncomeSearchCompService } from '../../../services/other-income-search-comp.service';
import { TOtherIncomeCompany } from '../../../../shared/types/other-income.type';
import { FormsModule } from '@angular/forms';

const DEFAULT_COMP = { compCode: '', compName: '', compName2: '' }

@Component({
  selector: 'other-income-create-pair-company-picker',
  imports: [FormsModule],
  templateUrl: './create-pair-company-picker.component.html',
  styles: '',
  providers: [OtherIncomeSearchCompService],
})
export class CreatePairCompanyPickerComponent implements FormValueControl<TOtherIncomeCompFormState> {
  searchCompNameRef = viewChild<ElementRef<HTMLInputElement>>('searchCompName')

  value: ModelSignal<TOtherIncomeCompFormState> = model({ dnComp: DEFAULT_COMP, huComp: DEFAULT_COMP });
  errors = input<readonly ValidationError.WithOptionalFieldTree[]>([]);
  disabled = input(false);
  touched = model(false);
  focus(options?: FocusOptions): void {
    this.searchCompNameRef()?.nativeElement.focus(options);
  }
  onBlurSearchText() {
    this.touched.set(true)
  }
  selectedDNComp = computed(() => {
    const v = this.value().dnComp;
    return v.compCode ? v : null;
  });
  selectedHUComp = computed(() => {
    const v = this.value().huComp;
    return v.compCode ? v : null;
  });

  searchCompanyName = signal('')
  private readonly searchCompService = inject(OtherIncomeSearchCompService)
  dnTerm = this.searchCompService.dnCompName
  huTerm = this.searchCompService.huCompName
  triggerSearch(term: string) {
    this.searchCompanyName.set(term)
    this.dnTerm.set(term)
    this.huTerm.set(term)
  }
  dnCompResult = this.searchCompService.dnCompResult
  onSelectDNComp(dnComp: TOtherIncomeCompany) {

    this.touched.set(true)
    this.value.update(prev => ({ ...prev, dnComp: dnComp }))

  }
  huCompResult = this.searchCompService.huCompResult
  onSelectHUComp(huComp: TOtherIncomeCompany) {

    this.touched.set(true)
    this.value.update(prev => ({ ...prev, huComp: huComp }))

  }
  clearDNComp() {
    this.value.update(prev => ({ ...prev, dnComp: DEFAULT_COMP }))
  }
  clearHUComp() {
    this.value.update(prev => ({ ...prev, huComp: DEFAULT_COMP }))
  }
}

type TOtherIncomeComp = {
  compCode: string
  compName: string
  compName2: string
}

type TOtherIncomeCompFormState = {
  dnComp: TOtherIncomeComp
  huComp: TOtherIncomeComp
}
