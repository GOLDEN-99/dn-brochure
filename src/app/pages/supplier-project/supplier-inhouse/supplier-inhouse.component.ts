import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SUPPLIER_TOKEN } from '../../../service/supplier/supplier.token';

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
  private router = inject(Router)
  private route = inject(ActivatedRoute)
  goTo(idx: number) {
    this.router.navigate([idx], { relativeTo: this.route })
  }
}
