import { Component, computed, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CN_TYPE, TCnType } from '../../types/cn.type';
import { TMaybe } from '../../../../shared/types/index.type';
import { FormValueControl, ValidationError } from '@angular/forms/signals';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';


@Component({
  selector: 'cn-type-radio',
  imports: [FormsModule, NgbTooltipModule],
  templateUrl: './cn-type-radio.component.html',
  styles: '',
})
export class CnTypeRadioComponent implements FormValueControl<TMaybe<TCnType>> {
  readonly cnRef = CN_TYPE
  cnCount = input(0)
  cannotCNWhole = computed(() => this.cnCount() !== 0)
  value = model<TMaybe<TCnType>>(null)
  disabled = input(false)
  required = input(false)

  readonly = input(false)
  dirty = input(false)

  errors = input<readonly ValidationError.WithOptionalFieldTree[]>([])
}
