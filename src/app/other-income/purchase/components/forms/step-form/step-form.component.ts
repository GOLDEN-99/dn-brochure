import { Component, computed, input } from '@angular/core';
import { FieldTree, FormField } from '@angular/forms/signals';
import { FormAlertTextComponent } from "../../../../../components/crm-promotion/form-alert-text.component";
import { RadioComponent } from "../../../../../shared/components/radio/radio.component";

@Component({
  selector: 'other-income-step-form',
  imports: [FormField, FormAlertTextComponent, RadioComponent],
  templateUrl: './step-form.component.html',
  styles: '',
})
export class StepFormComponent {
  stepForm = input.required<FieldTree<TOtherIncomeStepFormState>>()
  onAddStep() {
    this.stepForm().steps().controlValue.update((steps => [...steps, { min: 0, rate: 0 }]))
  }
  disableStepManagerment = computed(() => {
    const formState = this.stepForm()()
    return formState.disabled() || formState.readonly()
  })
  showManyStep = computed(() => {
    const stepType = this.stepForm().stepType().value()
    return stepType === 2 || stepType === 3
  })
}
type TOtherIncomeCapFormState = {
  isCap: boolean
  capAmount: number
}
type TOtherIncomeStepFormState = {
  cap: TOtherIncomeCapFormState
  stepType: number
  steps: Array<TOtherIncomeStepItemFormState>
  step: TOtherIncomeStepItemFormState
}

type TOtherIncomeStepItemFormState = {
  min: number
  rate: number
}