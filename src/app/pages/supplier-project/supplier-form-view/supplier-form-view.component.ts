import { Component, effect, inject } from '@angular/core';
import { SUPPLIER_TOKEN } from '../../../service/supplier/supplier.token';
import { JsonPipe } from '@angular/common';
import { AuthPageComponent } from '../auth-page/auth-page.component';

@Component({
  selector: 'app-supplier-form-view',
  imports: [AuthPageComponent],
  templateUrl: './supplier-form-view.component.html',
  styleUrl: './supplier-form-view.component.scss'
})
export class SupplierFormViewComponent {

  private dataService = inject(SUPPLIER_TOKEN)
  comp = this.dataService.compBase
}
