import { Component, computed, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DiscountService } from '../../../../service/other-income/discount.service';

@Component({
  selector: 'app-discount-subform',
  imports: [FormsModule],
  template: `
  <div class="row">
    @let discountValue = discountType();
    <div class="col-md-3">ส่วนลด</div>
    <div class="col-md">
      <div class="app-form-check">
        <input
          type="radio"
          name="discount"
          id="discount-false"
          [value]="false"
          [ngModel]="discountValue === 1"
          (ngModelChange)="changeDiscountType(0)"
        />
        <label for="discount-false">หักส่วนลด</label>
      </div>
      @if (discountValue !== 1) {
      <div class="app-form-select">
        <label for="discount-type-select">ประเภทส่วนลด</label>
        <select
          name="discount-type"
          id="discount-type-select"
          [ngModel]="discountType()"
          (ngModelChange)="changeDiscountType($event)"
        >
          <option [ngValue]="0" disabled>กรุณาเลือก</option>
          @for(d of  renderList(); track d.id){
            <option [ngValue]="d.id">{{d.discountName}}</option>
          }
        </select>
      </div>
      }
    </div>
    <div class="col-md">
      <div class="app-form-check">
        <input
          type="radio"
          name="discount"
          id="discount-true"
          [value]="true"
          [ngModel]="discountValue === 1"
          (ngModelChange)="changeDiscountType(1)"
        />
        <label for="discount-true">ไม่หักส่วนลด</label>
      </div>
    </div>
  </div>
  `,
  styles: ``
})
export class DiscountSubformComponent {

  discountType = input(0)
  discountTypeChange = output<number>()

  private discountService = inject(DiscountService)

  renderList = this.discountService.discount

  changeDiscountType(value: number) {
    this.discountTypeChange.emit(value)
  }

  // invalidDiscount = computed(() => this.discount() && this.discountType() !== 0)
}