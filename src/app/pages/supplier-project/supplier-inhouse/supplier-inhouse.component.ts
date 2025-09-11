import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SUPPLIER_TOKEN } from '../../../service/supplier/supplier.token';
import { CUSTOM_FIELD_SEARCH_TOKEN, IBOB_SUPPLIER_COMP_SEARCH } from '../../../components/inbound-outbound/ibob-query-tab/ibob-query-tab-token';
import { IbobQueryTabComponent } from '../../../components/inbound-outbound/ibob-query-tab/ibob-query-tab.component';
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
export class SupplierInhouseComponent {
  dataService = inject(SUPPLIER_TOKEN)
  compBase = this.dataService.compBase
  pageHeader = this.dataService.pageLabel
  private router = inject(Router)
  private route = inject(ActivatedRoute)
  compCode = this.dataService.compCode
  term = this.dataService.term
  goTo(idx: string) {
    this.router.navigate([idx], { relativeTo: this.route })
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
  compList = this.dataService.compList
}
