import { Component, computed, input } from '@angular/core';
import { FieldTree, FormField } from '@angular/forms/signals';
import { FormAlertTextComponent } from "../../../../../components/crm-promotion/form-alert-text.component";
import { RadioComponent } from "../../../../../shared/components/radio/radio.component";
import { TCalcSpecForm } from '../../forms/create-schema';

@Component({
  selector: 'other-income-step-form',
  imports: [FormField, FormAlertTextComponent, RadioComponent],
  templateUrl: './step-form.component.html',
  styles: '',
})
export class StepFormComponent {
  stepForm = input.required<FieldTree<TCalcSpecForm>>()

  onAddStep() {
    this.stepForm().bracketSteps().controlValue.update((steps => [...steps, { min: 0, rate: 0 }]))
  }

  disableStepManagerment = computed(() => {
    const formState = this.stepForm()()
    return formState.disabled() || formState.readonly()
  })

  showManyStep = computed(() => {
    const calcType = this.stepForm().calcType().value()
    return calcType === 'Step' || calcType === 'Cumulative'
  })
}
