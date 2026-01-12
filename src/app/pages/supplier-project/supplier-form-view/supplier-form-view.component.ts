import { Component, computed, effect, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { SUPPLIER_TOKEN } from '../../../service/supplier/supplier.token';
import { JsonPipe } from '@angular/common';
import { AuthPageComponent } from '../auth-page/auth-page.component';
import { GeneralPageComponent } from '../general-page/general-page.component';
import { StepThreePageComponent } from '../step-three-page/step-three-page.component';
import { SupplierApiService } from '../../../service/supplier/supplier-api.service';
import { SupplierFromService } from '../../../service/supplier/supplier-from.service';
import { Subject, takeUntil } from 'rxjs';
import { RouterLink } from '@angular/router';
import { ConditionPageComponent } from "../condition-page/condition-page.component";

@Component({
  selector: 'app-supplier-form-view',
  imports: [AuthPageComponent, GeneralPageComponent, StepThreePageComponent, RouterLink, ConditionPageComponent],
  templateUrl: './supplier-form-view.component.html',
  styleUrl: './supplier-form-view.component.scss'
})
export class SupplierFormViewComponent implements OnInit, OnDestroy {
  ngOnInit(): void {
    this.supplierApi.formmatComp$
      .pipe(takeUntil(this.sub$))
      .subscribe({
        next: ({ formState, emplList, itemList }) => {
          this.formService.formState.update(prev => ({ ...prev, ...formState }))
          this.formService.emplList.set(emplList)
          this.formService.item.set(itemList)
        }
      })
  }
  readonly = signal(true)

  toggle = () => {
    this.readonly.update(prev => !prev)
  }
  ngOnDestroy(): void {
    this.sub$.next()
    this.sub$.complete()
  }
  private supplierApi = inject(SupplierApiService)
  private formService = inject(SupplierFromService)
  private sub$ = new Subject<void>()

  disable = computed(() => {
    const cur = this.formService.formState()
    // return cur.compGroupCode === '' || cur.compName === '' || cur.username === '' || cur.username === ''
    return false
  })

  disableClass = computed(() => this.disable() ? "btn btn-primary w-100 disabled" : "btn btn-primary w-100")
}
