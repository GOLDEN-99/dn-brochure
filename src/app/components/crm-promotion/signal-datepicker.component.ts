import {
  Component,
  computed,
  ElementRef,
  inject,
  input,
  InputSignal,
  InputSignalWithTransform,
  model,
  ModelSignal,
  OutputRef,
  viewChild,
} from '@angular/core';
import {
  DisabledReason,
  FormValueControl,
  ValidationError,
  WithOptionalFieldTree,
} from '@angular/forms/signals';
import {
  NgbCalendar,
  NgbDate,
  NgbDatepickerModule,
  NgbDateStruct,
} from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-signal-datepicker',
  imports: [FormsModule, NgbDatepickerModule],
  template: `
    <div class="input-group">
      <div class="dp-hidden position-absolute">
        <input
          name="datepicker"
          ngbDatepicker
          #cal="ngbDatepicker"
          tabindex="-1"
          [ngModel]="value()"
          (dateSelect)="onClick($event)"
          style="border: none"
        />
      </div>
      <input
        #dpFromDate
        [id]="id()"
        class="form-control"
        [value]="displayDate()"
        name="dpFromDate"
        readonly
        [required]="required()"
      />
      <button
        class="btn btn-outline-secondary bi bi-calendar3"
        (click)="cal.toggle()"
        [disabled]="disableClick()"
        type="button"
      ></button>
    </div>
  `,
  styles: '',
})
export class SignalDatepickerComponent implements FormValueControl<NgbDateStruct> {
  private readonly calService = inject(NgbCalendar);
  private readonly inputEl = viewChild<ElementRef<HTMLInputElement>>('dpFromDate');
  id = input('');
  value: ModelSignal<NgbDateStruct> = model<NgbDateStruct>(this.calService.getToday());
  checked?: undefined;
  errors?:
    | InputSignal<readonly ValidationError.WithOptionalFieldTree[]>
    | InputSignalWithTransform<readonly ValidationError.WithOptionalFieldTree[], unknown>
    | undefined;
  disabled?: InputSignal<boolean> | InputSignalWithTransform<boolean, unknown> | undefined;
  disabledReasons?:
    | InputSignal<readonly WithOptionalFieldTree<DisabledReason>[]>
    | InputSignalWithTransform<readonly WithOptionalFieldTree<DisabledReason>[], unknown>
    | undefined;
  readonly?: InputSignal<boolean> | InputSignalWithTransform<boolean, unknown> | undefined;
  hidden?: InputSignal<boolean> | InputSignalWithTransform<boolean, unknown> | undefined;
  invalid?: InputSignal<boolean> | InputSignalWithTransform<boolean, unknown> | undefined;
  pending?: InputSignal<boolean> | InputSignalWithTransform<boolean, unknown> | undefined;
  touched?:
    | InputSignal<boolean>
    | ModelSignal<boolean>
    | OutputRef<boolean>
    | InputSignalWithTransform<boolean, unknown>
    | undefined;
  dirty?: InputSignal<boolean> | InputSignalWithTransform<boolean, unknown> | undefined;
  name?: InputSignal<string> | InputSignalWithTransform<string, unknown> | undefined;
  required = input(false);
  min?: InputSignal<number | undefined> | InputSignalWithTransform<number | undefined, unknown> | undefined;
  max?: InputSignal<number | undefined> | InputSignalWithTransform<number | undefined, unknown> | undefined;
  disableClick = input(false);
  focus(options?: FocusOptions): void {
    this.inputEl()?.nativeElement.focus(options);
  }
  thaiDate(date: NgbDateStruct | null) {
    if (!date) return 'กรุณาเลือกวันที่';
    return `${date.day}/${date.month}/${date.year}`;
  }
  displayDate = computed(() => this.thaiDate(this.value()));
  onClick(date: NgbDate) {
    this.value.set(date);
  }
}
