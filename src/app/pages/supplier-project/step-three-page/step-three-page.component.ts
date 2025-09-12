import { Component, computed, inject, input, OnDestroy, OnInit, TemplateRef } from '@angular/core';
import { BaseSupplierForm } from '../../../lib/supplier/baseForm';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ModalLayoutComponent } from "../../../components/modal/modal-layout/modal-layout.component";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SearchSupplierComponent } from "../../../components/inbound-outbound/search-supplier/search-supplier.component";
import { IbobCompService } from '../../../service/supplier/ibob-comp.service';
import { TComp } from '../../../types/ibob-supplier.type';
import { TOIComp } from '../../../service/other-income/company.service';
import { TMaybe } from '../../../types';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, takeUntil } from 'rxjs';
import { TDNCreate } from '../../../service/supplier/supplier-api.service';

@Component({
  selector: 'app-step-three-page',
  imports: [FormsModule, ModalLayoutComponent, SearchSupplierComponent],
  templateUrl: './step-three-page.component.html',
  styleUrl: './step-three-page.component.scss'
})
export class StepThreePageComponent extends BaseSupplierForm implements OnInit, OnDestroy {
  initialValue = input<TMaybe<TInit>>(null)
  private init$ = toObservable(this.initialValue).pipe(filter(a => a !== null), takeUntil(this.sub$))
  ngOnInit(): void {
    this.compService.setCompType(this.compType())
    this.init$.subscribe({
      next: ({ billIncludeVAT, dcPerDisc, tradePerDisc, cashPerDisc }) => {
        this.stepThree.controls.tax.patchValue({
          billIncludeVat: this.mapStrToBool(billIncludeVAT),
        })
      }
    })
  }
  ngOnDestroy(): void {
    this.unsub()
  }
  stepThree = this.formService.form.controls.stepThree
  // addEmpl = this.formService.addEmplList
  // removeEmpl = this.formService.removeEmplList
  protected modalService = inject(NgbModal)
  openModal(modal: TemplateRef<any>) {
    this.modalService.open(modal)
  }

  private compService = inject(IbobCompService)
  compGroup = this.compService.compGroup
  updator = this.formService.updator
  onSelectParentComp({ compCode, compName }: TOIComp) {
    this.formData.update(prev => ({ ...prev, parentCompCode: compCode, parentCompName: compName }))
    this.modalService.dismissAll()
  }
  clearParent() {
    this.formData.update(prev => ({ ...prev, parentCompCode: '', parentCompName: '' }))
  }

  formData = this.formService.formState

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