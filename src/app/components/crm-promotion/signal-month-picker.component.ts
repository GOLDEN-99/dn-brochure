import {
  Component,
  computed,
  ElementRef,
  InputSignal,
  InputSignalWithTransform,
  input,
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
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-signal-month-picker',
  imports: [FormsModule],
  template: `
    <input
      #monthInput
      [id]="id()"
      type="month"
      class="form-control"
      [ngModel]="monthValue()"
      (ngModelChange)="onChange($event)"
      [required]="required()"
    />
  `,
  styles: '',
})
export class SignalMonthPickerComponent implements FormValueControl<NgbDateStruct> {
  private readonly inputEl = viewChild<ElementRef<HTMLInputElement>>('monthInput');
  id = input('');
  value: ModelSignal<NgbDateStruct> = model<NgbDateStruct>({ year: new Date().getFullYear(), month: new Date().getMonth() + 1, day: 1 });
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
  focus(options?: FocusOptions): void {
    this.inputEl()?.nativeElement.focus(options);
  }
  monthValue = computed(() => {
    const { year, month } = this.value();
    return `${year}-${month.toString().padStart(2, '0')}`;
  });
  onChange(monthStr: string): void {
    if (!monthStr) return;
    const [year, month] = monthStr.split('-').map(Number);
    this.value.set({ year, month, day: 1 });
  }
}
