import { Component, computed, inject, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbCalendar, NgbDate, NgbDatepickerModule, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

let id = 0;

@Component({
  selector: 'app-date-input',
  imports: [NgbDatepickerModule, FormsModule],
  template: `
  <div class="mb-3">
  <div class="dp-hidden position-absolute">
    <div class="input-group">
      <input
        [id]="'date-input-hide-' + id"
        id="form-date"
        name="datepicker"
        ngbDatepicker
        #cal="ngbDatepicker"
        tabindex="-1"
        [ngModel]="date()"
        (ngModelChange)="onChange($event)"
        style="border: none"
      />
    </div>
  </div>
  <div class="input-group">
    <div class="form-floating">
      <input
        [id]="'date-input-' + id"
        #dpFromDate
        class="form-control"
        [value]="displayDate()"
        name="dpFromDate"
        readonly
        [required]="required()"
      />
      <label class="form-label" [attr.for]="'date-input-' + id">
        {{ label() }}
        @if (required()) {
          <span class="text-danger">*</span>
        }
      </label>
    </div>
    <button
      class="btn btn-outline-secondary bi bi-calendar3"
      (click)="cal.toggle()"
      [disabled]="disableClick()"
      type="button"
    ></button>
  </div>
</div>
  `,
  styles: ''
})
export class DateInputComponent {
  private readonly calendar = inject(NgbCalendar)
  id = id++
  date = model<NgbDateStruct>(this.calendar.getToday())

  label = input.required<string>()
  disableClick = input(false)
  required = input(false)
  thaiDate(date: NgbDateStruct | null) {
    if (!date) return "กรุณาเลือกวันที่"
    return `${date.day}/${date.month}/${date.year}`
  }
  displayDate = computed(() => this.thaiDate(this.date()))
  onChange(date: NgbDate) {
    this.date.set(date)
  }
}
