import { Component, model, output, signal } from '@angular/core';
import { SupllierSelectComponent } from "../supllier-select/supllier-select.component";
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-supplier',
  imports: [SupllierSelectComponent, FormsModule],
  templateUrl: './search-supplier.component.html',
  styles: ''
})
export class SearchSupplierComponent {
  selectedSuplier = output<TComp>()
  sup = signal({ id: 0, label: 'กรุณาเลือก' })
  term = signal("")
  items = signal<TComp[]>([])

}

type TComp = {
  comp: string,
  conpCode: string
}

type TOpt = { id: number, label: string } | null
