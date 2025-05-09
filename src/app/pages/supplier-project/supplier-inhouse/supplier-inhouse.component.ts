import { Component, inject } from '@angular/core';
import { SUPPLIER_TOKEN } from '../../../lib';

@Component({
  selector: 'app-supplier-inhouse',
  imports: [],
  templateUrl: './supplier-inhouse.component.html',
  styleUrl: './supplier-inhouse.component.scss'
})
export class SupplierInhouseComponent {
  dataService = inject(SUPPLIER_TOKEN)
  data = this.dataService.data
  pageHeader = this.dataService.pageLabel
}
