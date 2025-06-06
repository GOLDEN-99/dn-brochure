import { Component, computed, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-discount-subform',
  imports: [FormsModule],
  template: `
  <div class="row">
    @let discountValue = discount();
    <div class="col-md-3">ส่วนลด</div>
    <div class="col-md">
      <div class="app-form-check">
        <input
          type="radio"
          name="discount"
          id="discount-true"
          [value]="true"
          [ngModel]="discountValue"
          (ngModelChange)="changeDiscount($event)"
        />
        <label for="discount-true">หักส่วนลด</label>
      </div>
      @if (discount()) {
      <div class="app-form-select">
        <label for="discount-type-select">ประเภทส่วนลด select event from api here</label>
        <select
          name="discount-type"
          id="discount-type-select"
          [ngModel]="discountType()"
          (ngModelChange)="changeDiscountType($event)"
        >
          <option [ngValue]="0" disabled>empty</option>
          <option [ngValue]="1">DC</option>
        </select>
      </div>
      }
    </div>
    <div class="col-md">
      <div class="app-form-check">
        <input
          type="radio"
          name="discount"
          id="discount-false"
          [value]="false"
          [ngModel]="discountValue"
          (ngModelChange)="changeDiscount($event)"
        />
        <label for="discount-false">ไม่หักส่วนลด</label>
      </div>
    </div>
  </div>
  `,
  styles: ``
})
export class DiscountSubformComponent {
  discount = input(false)
  discountChange = output<boolean>()

  discountType = input(0)
  discountTypeChange = output<number>()
  changeDiscount(value: boolean) {
    this.discountChange.emit(value)
    this.discountTypeChange.emit(0)
  }
  changeDiscountType(value: number) {
    this.discountTypeChange.emit(value)
  }

  invalidDiscount = computed(() => this.discount() && this.discountType() !== 0)
}