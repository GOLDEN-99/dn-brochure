import { Component, inject, input, OnInit, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbCalendar } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-year-select',
  imports: [FormsModule],
  template: `
  <div class="app-form-select">
    <label for="year-select">เดือน</label>
    <select
      name="year-select"
      id="year-select"
      [ngModel]="year()"
      (ngModelChange)="yearChange.emit($event)"
    >
      @for (y of ref(); track y) {
      <option [ngValue]="y">{{ y }}</option>
      }
    </select>
  </div>
  `,
  styles: ''
})
export class YearSelectComponent implements OnInit {

  ngOnInit(): void {
    let arr = []
    const curYear = this.currentYear
    for (let start = curYear - 5; start <= curYear + 5; start++) {
      arr.push(start)
    }
    this.ref.update(() => arr)
  }

  private calServ = inject(NgbCalendar)
  private currentYear = this.calServ.getToday().year
  year = input(this.currentYear)
  yearChange = output<number>()
  ref = signal<number[]>([])
}
