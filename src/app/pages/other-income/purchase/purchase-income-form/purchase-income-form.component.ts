import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgbDatepickerModule } from '@ng-bootstrap/ng-bootstrap';
import { OtherIncomeBaseformComponent } from "../../../../components/other-income/form/other-income-baseform/other-income-baseform.component";
import { OiBaseformService } from '../../../../service/other-income/oi-baseform.service';
@Component({
  selector: 'app-purchase-income-form',
  imports: [FormsModule, NgbDatepickerModule, RouterLink, OtherIncomeBaseformComponent],
  template: `
  <app-other-income-baseform mode="not-light" (isLightChange)="isLight.set($event)" />
  <div class="d-flex justify-content-center" style="gap: 1rem">
    <button class="btn btn-success" (click)="onSubmit()">
      <i class="bi bi-floppy"></i>
      <span> บันทึก </span>
    </button>
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

  private baseFormService = inject(OiBaseformService)
  private comp = this.baseFormService.compData
  private router = inject(Router)
  private route = inject(ActivatedRoute)
  isLight = signal(-1)
  isInce = computed(() => this.isLight() === 2)
  productList = this.baseFormService.productList
  onSubmit = () => {
    const comp = this.comp()
    this.baseFormService.createHead().subscribe(
      {
        next: ({ id }) => {
          this.baseFormService.resetForm()
          if (this.isInce()) {
            this.router.navigate(['../'], { relativeTo: this.route })
          } else {
            this.router.navigate([id], { relativeTo: this.route })
          }
        },
        error: (err) => {
          console.log(err)
        },
      }
    )
  }
}