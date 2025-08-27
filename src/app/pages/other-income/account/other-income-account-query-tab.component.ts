import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EventSelectComponent } from '../../../components/other-income/form/event-select/event-select.component';

@Component({
  selector: 'app-other-income-account-query-tab',
  imports: [FormsModule, EventSelectComponent],
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
        class="form-select"
      >
        <option [ngValue]="1" >รหัสซับ</option>
        <option [ngValue]="3">กิจกรรม</option>
        <option [ngValue]="2" [disabled]="disbleMode()">รหัสสินค้า</option>
      </select>
    </div>
    <div class="mb-3 col-md">
      <label for="period-status-select" class="form-label">สถานะ</label>
      <select
        name="period-status"
        id="period-status-select"
        [ngModel]="status()"
        (ngModelChange)="statusChange.emit($event)"
        class="form-select"
      >
        <option [ngValue]="1">ทั้งหมด</option>
        <option [ngValue]="2">สำเร็จ</option>
        <option [ngValue]="3">รอเพิ่มใบแจ้งหนี้</option>
        <option [ngValue]="4">รอเพิ่มใบเสร็จ</option>
      </select>
    </div>
  @if(field() !== 3){
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
  }@else {
    <app-event-select [filter]="'not-light'" [eventId]="event()" (eventIdChange)="eventChange.emit($event)" />
  }
  </div>
  `,
})
export class OtherIncomeAccountQueryTabComponent {
  compType = input<number>(1)
  compTypeChange = output<number>()

  field = input<number>(1)
  fieldChange = output<number>()

  event = input(0)
  eventChange = output<number>()

  status = input<number>(1)
  statusChange = output<number>()

  term = input('')
  termChange = output<string>()

  disbleMode = input<boolean>(false)

  onChangeFilter = (filter: number) => {
    if (filter === 3) {
      this.termChange.emit('')
    } else {
      this.eventChange.emit(0)
    }
    this.fieldChange.emit(filter);
  }
}
