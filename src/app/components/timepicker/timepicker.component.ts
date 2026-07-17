import { Component, computed, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-timepicker',
  imports: [FormsModule],
  templateUrl: './timepicker.component.html',
  styleUrl: './timepicker.component.scss',
})
export class TimepickerComponent {
  timepickerId = input<string>("")
  timepickerName = input<string>("")
  time = model<string>('08:00:00')
  step = input<number>(60)
  before = input<string | null>(null)
  after = input<string | null>(null)
  timeRef = Array.from({ length: 16 }, (_, i) => `${String(i + 8).padStart(2, '0')}:00:00`)
  renderTime = computed(() => this.timeRef)
  formatTime = (time: string) => {
    return time.substring(0, 5)
  }
}
