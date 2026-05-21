import { Component, computed, inject, input } from '@angular/core';
import { FieldTree, FormField } from '@angular/forms/signals';
import { SelectComponent } from '../../../../shared/components/select/select.component';
import { TOtherIncomeEvent } from '../../types/other-income.type'
import { OptionComponent } from '../../../../shared/components/select/option.component';
import { OtherIncomeEventService } from '../../services/other-income-event.service';

@Component({
  selector: 'other-income-event-select',
  imports: [SelectComponent, OptionComponent, FormField],
  templateUrl: './other-income-event-select.component.html',
  styleUrl: './other-income-event-select.component.scss',
})
export class OtherIncomeEventSelectComponent {
  private readonly otherIncomeEvent = inject(OtherIncomeEventService);
  eventList = this.otherIncomeEvent.event;
  eventType = input<number | null>(null);
  renderEvent = computed(() => this.eventList().filter((event) => this.eventType() === event.eventType || !this.eventType()));
  form = input.required<FieldTree<TOtherIncomeEvent | null, string>>();
}
