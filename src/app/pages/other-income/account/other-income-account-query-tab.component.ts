import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EventSelectComponent } from '../../../components/other-income/form/event-select/event-select.component';
import { TAccountQueryReqState } from '../../../service/other-income/period-not-light.service';

@Component({
  selector: 'app-other-income-account-query-tab',
  imports: [FormsModule, EventSelectComponent],
  template: `
  @let cur = param();
  <div class="row">
    <div class="mb-3 col-md">
      <label for="comp-type-select" class="form-label">เลือกประเภทซัพ</label>
      <select
        name="comp-type"
        id="comp-type-select"
        [ngModel]="cur.compType"
        (ngModelChange)="compTypeChange($event)"
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
        [ngModel]="cur.mode"
        (ngModelChange)="fieldChange($event)"
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
        [ngModel]="cur.filter"
        (ngModelChange)="statusChange($event)"
        class="form-select"
      >
        <option [ngValue]="1">ทั้งหมด</option>
        <option [ngValue]="2">สำเร็จ</option>
        <option [ngValue]="3">รอเพิ่มใบแจ้งหนี้</option>
        <option [ngValue]="4">รอเพิ่มใบเสร็จ</option>
      </select>
    </div>
  @if(cur.mode === 1){
    <div class="app-form-field">
      <label for="acc-search-term">รหัสซับ</label>
      <input
      type="text"
      name="acc-search-term"
      id="acc-search-term"
      [ngModel]="cur.compCode"
      (ngModelChange)="compCodeChange($event)"
      />
    </div>
  }@else if(cur.mode === 2){
        <div class="app-form-field">
      <label for="good-search-term">รหัสสินค้า</label>
      <input
      type="text"
      name="good-search-term"
      id="good-search-term"
      [ngModel]="cur.goodCode"
      (ngModelChange)="goodCodeChange($event)"
      />
    </div>
  }
  @else {
    <app-event-select [filter]="eventFilter()" [eventId]="cur.eventId" (eventIdChange)="eventChange($event)" />
  }
  </div>
  `,
})
export class OtherIncomeAccountQueryTabComponent {
  eventFilter = input.required<TFilter>();
  param = input.required<TAccountQueryReqState>()
  paramChange = output<TAccountQueryReqState>()
  onValueChange = <K extends keyof TAccountQueryReqState>(key: K) => (value: TAccountQueryReqState[K]) => {
    const cur = this.param()
    this.paramChange.emit(({ ...cur, [key]: value }))
  }
  compTypeChange = this.onValueChange("compType")
  fieldChange = this.onValueChange("mode")
  eventChange = this.onValueChange("eventId")
  statusChange = this.onValueChange("filter")
  termChange = this.onValueChange("term")
  compCodeChange = this.onValueChange("compCode")
  goodCodeChange = this.onValueChange("goodCode")
  disbleMode = input<boolean>(false)

  // onChangeFilter = (filter: number) => {
  //   if (filter === 3) {
  //     this.termChange('')
  //   } else {
  //     this.eventChange.emit(0)
  //   }
  //   this.fieldChange.emit(filter);
  // }
}

type TFilter = 'light' | 'not-light' | 'all'