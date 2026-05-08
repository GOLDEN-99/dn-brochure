import { Component, inject, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbTypeahead } from '@ng-bootstrap/ng-bootstrap';
import { debounceTime, distinctUntilChanged, map, Observable } from 'rxjs';
import { EventService, TEvent } from '../../../service/other-income/event.service';

@Component({
  selector: 'app-other-income-purchasing-query-tab',
  imports: [FormsModule, NgbTypeahead],
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
        <option ngValue="DN">DN</option>
        <option ngValue="HU">HU</option>
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
    <div class="mb-3">
      <label for="event-filter" class="form-label">กรองกิจกรรม</label>
      <input
        type="text"
        id="event-filter"
        class="form-control"
        [(ngModel)]="eventModel"
        (ngModelChange)="onEventModelChange($event)"
        [ngbTypeahead]="searchEvents"
        [inputFormatter]="formatEvent"
        [resultFormatter]="formatEvent"
        placeholder="พิมพ์เพื่อกรองกิจกรรม..."
      />
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


  </div>
  `,
})
export class OtherIncomePurchasingQueryTabComponent {
  compType = input<'DN' | 'HU'>('DN')
  compTypeChange = output<number>()

  field = input<number>(1)
  fieldChange = output<number>()

  term = input('')
  termChange = output<string>()

  eventFilter = input('')
  eventFilterChange = output<string>()

  disbleMode = input<boolean>(false)

  private readonly eventService = inject(EventService)

  searchEvents = (text$: Observable<string>): Observable<TEvent[]> =>
    text$.pipe(
      debounceTime(150),
      distinctUntilChanged(),
      map(term => {
        const lower = term.trim().toLowerCase()
        if (!lower) return []
        return this.eventService.event().filter(e => e.eventName.toLowerCase().includes(lower)).slice(0, 10)
      })
    )

  eventModel: TEvent | string = ''

  formatEvent = (e: TEvent | string) => typeof e === 'string' ? e : e.eventName

  onEventModelChange(value: TEvent | string) {
    this.eventFilterChange.emit(typeof value === 'string' ? value : value.eventName)
  }
}
