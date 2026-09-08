import { Component, input, InputSignal, InputSignalWithTransform, linkedSignal, model, ModelSignal, OutputRef, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DisabledReason, FormValueControl, ValidationError, WithOptionalFieldTree } from '@angular/forms/signals';
import { TGoodItemState } from '../../types/cn.type';
import { DecimalPipe } from '@angular/common';

let ref = 0

@Component({
  selector: 'cn-good-item',
  imports: [FormsModule, DecimalPipe],
  templateUrl: './good-item.component.html',
  styleUrl: './good-item.component.scss',
})
export class GoodItemComponent implements FormValueControl<number> {
  value = model(0);
  displayValue = linkedSignal<string>(() => {
    const value = this.value();
    if (Number.isNaN(value)) return ''
    return String(value)
  })
  onValueChange(event: string) {
    const prased = Number.parseInt(event)
    this.value.set(prased)
  }
  goodInfo = input.required<Pick<TGoodItemState, 'barCode' | 'goodCode' | 'goodName' | 'unitDesc' | 'subTotal' | 'goodAmou'>>()
  name = input('return-amount')
  id = signal(`return-amount-input-${ref}`)
  errors = input<readonly ValidationError.WithOptionalFieldTree[]>([])
  disabled?: InputSignal<boolean> | InputSignalWithTransform<boolean, unknown> | undefined;
  disabledReasons?: InputSignal<readonly WithOptionalFieldTree<DisabledReason>[]> | InputSignalWithTransform<readonly WithOptionalFieldTree<DisabledReason>[], unknown> | undefined;
  readonly = input(false)
  invalid = input(false)
  pending?: InputSignal<boolean> | InputSignalWithTransform<boolean, unknown> | undefined;
  touched?: InputSignal<boolean> | InputSignalWithTransform<boolean, unknown> | ModelSignal<boolean> | OutputRef<boolean> | undefined;
  dirty?: InputSignal<boolean> | InputSignalWithTransform<boolean, unknown> | undefined;
  required = input(false)

}
