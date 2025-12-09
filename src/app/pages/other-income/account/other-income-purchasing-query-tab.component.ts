import { Component, inject, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-other-income-purchasing-query-tab',
  imports: [FormsModule],
  template: `
  <div class="row">
    <div class="mb-3 col-md">
      <label for="comp-type-select" class="form-label">เลือกประเภทซัพ</label>
      <select
        name="comp-type"
        id="comp-type-select"
        [ngModel]="compType()"
        (ngModelChange)="compTypeChange.emit($event)"
        class="form-select"
      >
        <option [ngValue]="1">DN</option>
        <option [ngValue]="2">HU</option>
      </select>
    </div>
    <div class="mb-3 col-md">
      <label for="search-field-select" class="form-label">ค้นหาจาก</label>
      <select
        name="search-field"
        id="search-field-select"
        [ngModel]="field()"
        (ngModelChange)="fieldChange.emit($event)"
        [disabled]="disbleMode()"
        class="form-select"
      >
        <option [ngValue]="1">รหัสซับ</option>
        <option [ngValue]="2">ชื่อซับ</option>
        <option [ngValue]="3">รหัสสินค้า</option>
      </select>
    </div>

    <div class="app-form-field">
      <label for="acc-search-term">คำค้นหา</label>
      <input
        type="text"
        name="acc-search-term"
        id="acc-search-term"
        [ngModel]="term()"
        (ngModelChange)="termChange.emit($event)"
      />
    </div>
    <div class="mb-3">
      <button class="btn btn-primary w-100" (click)="click.emit()">ค้นหา</button>
    </div>
  </div>
  `,
})
export class OtherIncomePurchasingQueryTabComponent {
  compType = input<number>(1)
  compTypeChange = output<number>()

  field = input<number>(1)
  fieldChange = output<number>()

  term = input('')
  termChange = output<string>()

  disbleMode = input<boolean>(false)

  click = output<void>()

}
