import { ChangeDetectionStrategy, Component, effect, ElementRef, HostListener, inject, input, InputSignal, InputSignalWithTransform, model } from '@angular/core';
import { FormValueControl, ValidationError } from '@angular/forms/signals';
import { SelectService } from './select.service';

@Component({
  selector: 'app-select',
  templateUrl: './select.component.html',
  styleUrl: './select.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [SelectService],
})
export class SelectComponent<T> implements FormValueControl<T | null> {
  readonly value = model<T | null>(null);
  readonly placeholder = input<string>('กรุณาเลือก');
  errors?: InputSignal<readonly ValidationError.WithOptionalFieldTree[]> | InputSignalWithTransform<readonly ValidationError.WithOptionalFieldTree[], unknown> | undefined;
  protected readonly service = inject(SelectService<T>);
  private readonly el = inject(ElementRef);

  constructor() {
    effect(() => this.value.set(this.service.selectedValue() as T | null));
  }

  @HostListener('document:click', ['$event.target'])
  onOutsideClick(target: EventTarget | null) {
    if (!this.el.nativeElement.contains(target)) {
      this.service.close();
    }
  }
}
