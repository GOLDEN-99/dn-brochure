import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SUPPLIER_TOKEN } from '../../../service/supplier/supplier.token';
import { CUSTOM_FIELD_SEARCH_TOKEN, IBOB_SUPPLIER_COMP_SEARCH } from '../../../components/inbound-outbound/ibob-query-tab/ibob-query-tab-token';
import { IbobQueryTabComponent } from '../../../components/inbound-outbound/ibob-query-tab/ibob-query-tab.component';
import { SupplierApiService } from '../../../service/supplier/supplier-api.service';
import { SupplierFromService } from '../../../service/supplier/supplier-from.service';
@Component({
  selector: 'app-supplier-inhouse',
  imports: [IbobQueryTabComponent, RouterLink],
  templateUrl: './supplier-inhouse.component.html',
  styleUrl: './supplier-inhouse.component.scss',
  providers: [
    {
      provide: CUSTOM_FIELD_SEARCH_TOKEN,
      useValue: IBOB_SUPPLIER_COMP_SEARCH
    }
  ]
})
export class SupplierInhouseComponent implements OnInit {

  ngOnInit(): void {
    this.formService.resetForm()
  }

  formService = inject(SupplierFromService)
  apiService = inject(SupplierApiService)
  pageHeader = this.apiService.compType
  private router = inject(Router)
  private route = inject(ActivatedRoute)
  compCode = this.apiService.compCode
  term = this.apiService.term
  toCompForm(compCode: string) {
    this.router.navigate([compCode], { relativeTo: this.route })
  }
  toProductForm(compCode: string) {
    this.router.navigate([compCode, 'product'], { relativeTo: this.route })
  }
  onSearch({ field, term }: { field: string, term: string }) {
    if (field === 'compCode') {
      this.compCode.set(term)
      this.term.set('')
    } else {
      this.compCode.set('')
      this.term.set(term)
    }
  }
  compList = this.apiService.compList
}
