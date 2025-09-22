import { Component, computed, inject, input, OnDestroy, OnInit, TemplateRef } from '@angular/core';
import { BaseSupplierForm } from '../../../lib/supplier/baseForm';
import { FormsModule } from '@angular/forms';
import { ModalLayoutComponent } from "../../../components/modal/modal-layout/modal-layout.component";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SearchSupplierComponent } from "../../../components/inbound-outbound/search-supplier/search-supplier.component";
import { IbobCompService } from '../../../service/supplier/ibob-comp.service';
import { TOIComp } from '../../../service/other-income/company.service';
import { TMaybe } from '../../../types';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, takeUntil } from 'rxjs';
import { TDNCreate } from '../../../service/supplier/shared.type';
import { SupplierApiService } from '../../../service/supplier/supplier-api.service';

@Component({
  selector: 'app-step-three-page',
  imports: [FormsModule, ModalLayoutComponent, SearchSupplierComponent],
  templateUrl: './step-three-page.component.html',
  styleUrl: './step-three-page.component.scss'
})
export class StepThreePageComponent extends BaseSupplierForm {
  readonly = input(false)
  protected modalService = inject(NgbModal)
  openModal(modal: TemplateRef<any>) {
    this.modalService.open(modal)
  }
  private ibobApi = inject(SupplierApiService)
  compType = this.ibobApi.compType

  private compService = inject(IbobCompService)
  compGroup = this.compService.compGroup
  updator = this.formService.updator
  onSelectParentComp({ compCode, compName }: TOIComp) {
    this.formState.update(prev => ({ ...prev, parentCompCode: compCode, parentCompName: compName }))
    this.modalService.dismissAll()
  }
  clearParent() {
    this.formState.update(prev => ({ ...prev, parentCompCode: '', parentCompName: '' }))
  }

  private mapStrToBool(value: any) {
    switch (value) {
      case '0': return false
      case '1': return true
      default: return false
    }
  }

  compareCompGroup = (o1: any, o2: any) => o1 && o2 ? o1.compGroupCode === o2.compGroupCode : o1 === o2;
}

type TInit = Pick<TDNCreate, 'billIncludeVAT' | 'dcPerDisc' | 'tradePerDisc' | 'cashPerDisc'>