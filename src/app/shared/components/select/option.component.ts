import { ChangeDetectionStrategy, Component, computed, ElementRef, inject, input } from '@angular/core';
import { SelectService } from './select.service';

@Component({
  selector: 'app-option',
  template: `
    <li>
      <button role="option" type="button" class="dropdown-item d-flex justify-content-between align-items-center" [disabled]="cannotSelect()" (click)="onSelect()">
        <ng-content />
        @if (isSelected()) {
          <span>&#10003;</span>
        }
      </button>
    </li>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OptionComponent<T> {
  readonly value = input.required<T>();
  readonly disabled = input(false)
  private readonly service = inject(SelectService<T>);
  private readonly el = inject(ElementRef<HTMLElement>);

  protected readonly isSelected = computed(() => this.service.selectedValue() === this.value());

  cannotSelect = computed(() => this.isSelected() || this.disabled())

  protected onSelect(): void {
    const label = this.el.nativeElement.textContent?.trim() ?? '';
    this.service.select(this.value(), label);
  }
}
