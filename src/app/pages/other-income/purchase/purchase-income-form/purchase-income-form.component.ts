import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NgbCalendar, NgbDate, NgbDatepicker, NgbDatepickerModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-purchase-income-form',
  imports: [FormsModule, NgbDatepickerModule, RouterLink],
  templateUrl: './purchase-income-form.component.html',
  styleUrl: './purchase-income-form.component.scss'
})
export class PurchaseIncomeFormComponent {
  incVat = signal<boolean>(false)
  discount = signal(false)
  target = signal(0)
  percent = signal(0)
  invalidPercentTarget = computed(() => this.target() === 1 && this.percent() === 0)
  period = signal(0)
  limit = signal(false)
  limitAmount = signal(0)
  toggleLimit = (value: boolean) => {
    if (!value) {
      this.limitAmount.update(() => 0)
    }
    this.limit.update(prev => !prev)
  }
  calendar = inject(NgbCalendar);
  fromDate = signal(this.calendar.getToday())
  toDate = signal(this.calendar.getToday())
}
