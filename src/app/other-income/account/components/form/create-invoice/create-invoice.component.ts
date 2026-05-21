import { Component, input } from '@angular/core';
import { SignalDatepickerComponent } from "../../../../../components/crm-promotion/signal-datepicker.component";
import { FieldTree, FormField } from "@angular/forms/signals";
import { TCreateInvoiceForm } from './createInvoice.type';

@Component({
  selector: 'other-income-create-invoice',
  imports: [SignalDatepickerComponent, FormField],
  templateUrl: './create-invoice.component.html',
  styleUrl: './create-invoice.component.scss',
})
export class CreateInvoiceComponent {
  form = input.required<FieldTree<TCreateInvoiceForm>>()
}
