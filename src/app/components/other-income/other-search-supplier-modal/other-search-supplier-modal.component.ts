import { Component, computed, inject, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CompanyService } from '../../../service/other-income/company.service';
import { TCompType } from '../../../types';

@Component({
  selector: 'app-other-search-supplier-modal',
  imports: [FormsModule],
  templateUrl: './other-search-supplier-modal.component.html',
  styleUrl: './other-search-supplier-modal.component.scss'
})
export class OtherSearchSupplierModalComponent {

  private searchComp = inject(CompanyService)
  term = this.searchComp.term
  field = this.searchComp.field
  isName = computed(() => this.field() === 'name')
  changeName = (changeToName: boolean) => {
    if (changeToName) {
      this.field.set('name')
    } else {
      this.field.set('code')
    }
  }
  compList = this.searchComp.compList
  compType = signal<TCompType>('DN')
  isDn = computed(() => this.compType() === 'DN')
  changeDn = (changeToDn: boolean) => {
    if (changeToDn) {
      this.compType.set('DN')
    } else {
      this.compType.set('HU')
    }
  }

  selectComp = output<IComp>()

  close = output<void>()
  onClose() {
    this.close.emit()
  }
}

interface IComp { compCode: string, compName: string }