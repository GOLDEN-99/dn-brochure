import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgbDatepickerModule } from '@ng-bootstrap/ng-bootstrap';
import { OtherIncomeBaseformComponent } from "../../../../components/other-income/form/other-income-baseform/other-income-baseform.component";
import { OiBaseformService } from '../../../../service/other-income/oi-baseform.service';
import { ToastService } from '../../../../service/toast/toast.service';
import { OiNotLightListService } from '../../../../service/other-income/oi-not-light-list.service';
@Component({
  selector: 'app-purchase-income-form',
  imports: [FormsModule, NgbDatepickerModule, RouterLink, OtherIncomeBaseformComponent],
  template: `
  <app-other-income-baseform mode="not-light" [(eventType)]="eventType" />
  <div class="d-flex justify-content-center" style="gap: 1rem">
    @let btnLabel = displayText();
    @if(btnLabel !== ''){
      <button class="btn btn-success" (click)="onSubmit()" [disabled]="disabled()">
        <i class="bi bi-floppy"></i>
        <span> {{btnLabel}} </span>
      </button>
    }
    <a routerLink="../" class="btn btn-outline-danger"
      >ย้อนกลับ</a
    >
  </div>
  `,
  styles: `
      .layout {
      margin: auto;
      padding: 1rem;
      width: 100%;
      @media (min-width: 992px) {
        width: 920px;
      }
    }
    .step-item {
      list-style: none;
      background-color: #f5f5f5;
      padding: 0 8px;
      &:first-child {
        padding-top: 16px;
      }
    }
    .bg-lightgray {
      background-color: #f5f5f5;
    }
`
})
export class PurchaseIncomeFormComponent implements OnInit, OnDestroy {
  ngOnInit(): void {
    this.productList.set([])
  }
  ngOnDestroy(): void {
    this.baseFormService.resetForm();
  }

  private readonly baseFormService = inject(OiBaseformService)
  private readonly baseFormDisable = this.baseFormService.disableDc
  //private readonly comp = this.baseFormService.compData
  private readonly router = inject(Router)
  private readonly route = inject(ActivatedRoute)
  eventType = signal(-1)
  // isDcRebate = computed(() => this.isLight() === 1)
  isInce = computed(() => this.eventType() === 3)
  displayText = computed(() => {
    const eventType = this.eventType()
    switch (eventType) {
      case -1: return ''
      case 1: return 'ต่อไป'
      default: return 'บันทึก'
    }
  })
  disableProduct = computed(() => {
    const isInce = this.isInce()
    if (isInce) return false
    const products = this.productList()
    return products === null || products.length === 0
  })
  disabled = computed(() => this.disableProduct() || this.baseFormDisable())
  private readonly toast = inject(ToastService)
  productList = this.baseFormService.productList

  private readonly notLightList = inject(OiNotLightListService)

  onSubmit = () => {
    this.baseFormService.createHead().subscribe(
      {
        next: ({ id }) => {
          this.baseFormService.resetForm()
          if (this.isInce()) {
            this.notLightList.refetch()
            this.router.navigate(['../'], { relativeTo: this.route })
          } else {
            this.router.navigate([id], { relativeTo: this.route })
          }
        },
        error: (err) => {
          console.log(err)
          this.toast.danger(String(err))
        },
      }
    )
  }
}