import { Component, computed, inject, } from '@angular/core';
import { RemarkSelectComponent } from "../../shared/components/remark-select/remark-select.component";
import { FormField } from "@angular/forms/signals";
import { CnStateService } from '../../shared/services/cn-state.service';
import { RESULT_TYPE } from '../../shared/libs/remark-result';
import { ResultSelectComponent } from '../../shared/components/result-select/result-select.component';
import { RouterLink } from '@angular/router';
import { CnTypeRadioComponent } from '../../shared/components/cn-type-radio/cn-type-radio.component';
import { FormsModule } from '@angular/forms';
import { LoadingService } from '../../../service/loading/loading.service';



@Component({
  selector: 'app-create-cancel-request',
  imports: [RemarkSelectComponent, ResultSelectComponent, CnTypeRadioComponent, FormField, RouterLink, FormsModule],
  templateUrl: './create-cancel-request.component.html',
  styleUrl: './create-cancel-request.component.scss',
})
export class CreateCancelRequestComponent {

  private readonly formService = inject(CnStateService)
  loadingService = inject(LoadingService)



  showBankAccountDetail = computed(() => this.createForm.stepOne().value().cusStat === '1')
  createForm = this.formService.requestCNForm
  resultType = this.formService.resultType
  showCN = this.formService.showCN
  readonly ref = RESULT_TYPE
  endPoint = this.formService.endPoint
  btnClass = computed(
    () =>
      this.createForm.stepOne().invalid()
        ? 'btn btn-primary w-100 disabled'
        : 'btn btn-primary w-100'
  )
}
