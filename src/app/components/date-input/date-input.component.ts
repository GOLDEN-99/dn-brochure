import { Component, computed, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbCalendar, NgbDate, NgbDatepickerModule, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-date-input',
  imports: [NgbDatepickerModule, FormsModule],
  templateUrl: './date-input.component.html',
  styles: ''
})
export class DateInputComponent {
  private calendar = inject(NgbCalendar)
  id = Math.floor(Math.random() * 1000)
  date = input<NgbDateStruct>(this.calendar.getToday())
  label = input.required<string>()
  disableClick = input(false)
  thaiDate(date: NgbDateStruct | null) {
    if (!date) return "กรุณาเลือกวันที่"
    return `${date.day}/${date.month}/${date.year}`
  }
  displayDate = computed(() => this.thaiDate(this.date()))
  dateChange = output<NgbDate>()
  onClick(date: NgbDate) {
    this.dateChange.emit(date)
  }
}
