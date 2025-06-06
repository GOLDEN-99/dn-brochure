import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-limit-subform',
  imports: [FormsModule],
  template: `
  <div class="row">
    @let limitValue = limit();
    <div class="col-md-3">อัตราจ่ายไม่เกินกำหนด</div>
    <div class="col-md">
      <div class="app-form-check">
        <input
          type="radio"
          name="limit"
          id="limit-true"
          [value]="true"
          [ngModel]="limitValue"
          (ngModelChange)="changeLimit($event)"
        />
        <label for="limit-true">กำหนด</label>
      </div>
      @if (limitValue) {
      <div class="app-form-field">
        <label for="limit-amount" style="display: none"></label>
        <input
          type="number"
          name="limit-amount"
          id="limit-amount"
          [ngModel]="limitAmount()"
          (ngModelChange)="limitAmountChange.emit($event)"
          />
      </div>
      }
    </div>
    <div class="col-md">
      <div class="app-form-check">
        <label for="limit-false">ไม่กำหนด</label>
        <input
          type="radio"
          name="limit"
          id="limit-false"
          [value]="false"
          [ngModel]="limitValue"
          (ngModelChange)="changeLimit($event)"
        />
      </div>
    </div>
  </div>
  `,
  styles: ``
})
export class LimitSubformComponent {
  limit = input(false)
  limitChange = output<boolean>()
  limitAmount = input(0)
  limitAmountChange = output<number>()
  changeLimit(value: boolean) {
    this.limitChange.emit(value)
    this.limitAmountChange.emit(0)
  }
}
