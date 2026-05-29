import { Component, computed, inject } from '@angular/core';
import { CnStateService } from '../../shared/services/cn-state.service';
import { RouterLink } from '@angular/router';
import { FormField } from "@angular/forms/signals";
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CnProductPickerComponent } from "../../shared/components/cn-product-picker/cn-product-picker.component";

@Component({
  selector: 'cn-partial-cancel-product-picker',
  imports: [RouterLink, FormField, DecimalPipe, FormsModule, CnProductPickerComponent, RouterLink],
  templateUrl: './partial-cancel-product-picker.component.html',
  styles: '',
})
export class PartialCancelProductPickerComponent {
  private readonly cnState = inject(CnStateService)
  requestForm = this.cnState.requestCNForm
  checkCount = this.cnState.checkCount
  disable = computed(() => this.requestForm.stepOne().invalid() || this.requestForm.returnList().invalid())
  nextBtnClassName = computed(() => this.disable() ? 'btn btn-primary disabled' : 'btn btn-primary')

}
