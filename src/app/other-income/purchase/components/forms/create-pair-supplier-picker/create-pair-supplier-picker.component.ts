import { Component, computed, ElementRef, inject, input, model, ModelSignal, viewChild } from '@angular/core';
import { FormValueControl, ValidationError } from '@angular/forms/signals';
import { SelectComponent } from '../../../../../shared/components/select/select.component';
import { OptionComponent } from '../../../../../shared/components/select/option.component';
import { OtherIncomeSupplierPairService } from '../../../services/other-income-supplier-pair.service';
import { TOtherIncomeComp } from '../create-schema';

export type TPairSupplierFormState = {
  supplierPairId: number | null;
  dnComp: TOtherIncomeComp & { compType: 'DN' };
  huComp: TOtherIncomeComp & { compType: 'HU' };
}

const EMPTY_COMP = { compCode: '', compName: '', compName2: '' }

@Component({
  selector: 'other-income-create-pair-supplier-picker',
  imports: [SelectComponent, OptionComponent],
  templateUrl: './create-pair-supplier-picker.component.html',
  styles: '',
})
export class CreatePairSupplierPickerComponent implements FormValueControl<TPairSupplierFormState> {
  private readonly supplierPairService = inject(OtherIncomeSupplierPairService)
  supplierPairList = this.supplierPairService.supplierPairList

  value: ModelSignal<TPairSupplierFormState> = model<TPairSupplierFormState>({
    supplierPairId: null,
    dnComp: { ...EMPTY_COMP, compType: 'DN' },
    huComp: { ...EMPTY_COMP, compType: 'HU' },
  });
  errors = input<readonly ValidationError.WithOptionalFieldTree[]>([]);
  disabled = input(false);
  touched = model(false);

  selectRef = viewChild<ElementRef<HTMLElement>>('selectHost')
  focus(options?: FocusOptions): void {
    this.selectRef()?.nativeElement.focus(options)
  }

  selectedPair = computed(() => {
    const id = this.value().supplierPairId
    return this.supplierPairList().find(p => p.id === id) ?? null
  })

  onSelectPair(id: number | null) {
    this.touched.set(true)
    const pair = this.supplierPairList().find(p => p.id === id)
    if (!pair) {
      this.value.set({
        supplierPairId: null,
        dnComp: { ...EMPTY_COMP, compType: 'DN' },
        huComp: { ...EMPTY_COMP, compType: 'HU' },
      })
      return
    }
    this.value.set({
      supplierPairId: pair.id,
      dnComp: { compCode: pair.dnCompCode, compName: pair.displayName, compName2: '', compType: 'DN' },
      huComp: { compCode: pair.huCompCode, compName: pair.displayName, compName2: '', compType: 'HU' },
    })
  }
}
