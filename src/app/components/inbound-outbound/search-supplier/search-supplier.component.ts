import { Component, inject, model, output, signal } from '@angular/core';
import { SupllierSelectComponent } from "../supllier-select/supllier-select.component";
import { FormsModule } from '@angular/forms';
import { IbobCompService } from '../../../service/supplier/ibob-comp.service';
import { TOIComp } from '../../../service/other-income/company.service';

@Component({
  selector: 'app-search-supplier',
  imports: [SupllierSelectComponent, FormsModule],
  templateUrl: './search-supplier.component.html',
  styles: ''
})
export class SearchSupplierComponent {
  selectedSuplier = output<TOIComp>()
  private compService = inject(IbobCompService)
  items = this.compService.compList
  groupCode = this.compService.groupCode
  term = this.compService.term

}


type TOpt = { id: number, label: string } | null
