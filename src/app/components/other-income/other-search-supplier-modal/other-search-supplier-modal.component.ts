import { Component, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-other-search-supplier-modal',
  imports: [FormsModule],
  templateUrl: './other-search-supplier-modal.component.html',
  styleUrl: './other-search-supplier-modal.component.scss'
})
export class OtherSearchSupplierModalComponent {
  term = signal("")
  result = signal<IComp[]>([{ compCode: '1', compName: 'company 1' }, { compName: 'company 2', compCode: '2' }])

  selectComp = output<IComp>()

  close = output<void>()
  onClose() {
    this.close.emit()
  }
}

interface IComp { compCode: string, compName: string }