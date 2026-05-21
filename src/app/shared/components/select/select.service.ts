import { Injectable, signal } from '@angular/core';

@Injectable()
export class SelectService<T = unknown> {
  readonly isOpen = signal(false);
  readonly selectedValue = signal<T | null>(null);
  readonly selectedLabel = signal('');

  select(value: T, label: string): void {
    this.selectedValue.set(value);
    this.selectedLabel.set(label);
    this.isOpen.set(false);
  }

  toggle(): void { this.isOpen.update(v => !v); }
  close(): void { this.isOpen.set(false); }
}
