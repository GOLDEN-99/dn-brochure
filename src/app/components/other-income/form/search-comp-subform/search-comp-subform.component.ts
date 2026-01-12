import { Component, computed, inject, input, OnInit, output, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TCompType } from '../../../../types';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CompanyService } from '../../../../service/other-income/company.service';

@Component({
  selector: 'app-search-comp-subform',
  imports: [FormsModule],
  templateUrl: './search-comp-subform.component.html',
  styleUrl: './search-comp-subform.component.scss'
})
export class SearchCompSubformComponent {
  compType = input<TCompType>("DN")
  compTypeChange = output<TCompType>()
  compCode = input<string>("")
  compCodeChange = output<string>()

  compName = input<string>("")
  // side efffect value
  compNameChange = output<string>()

  hasSelectComp = computed(() => this.compName() !== '' && this.compCode() !== '')

  private modalService = inject(NgbModal)
  private searchSupplierModal = viewChild('searchSupplierModal')
  openSearchSupplier() {
    const ref = this.modalService.open(this.searchSupplierModal())
  }
  selectComp({ compCode, compName }: { compCode: string, compName: string }) {
    this.compNameChange.emit(compName)
    this.compCodeChange.emit(compCode)
    this.modalService.dismissAll()
  }
  onChangeCompType(type: TCompType) {
    this.compTypeChange.emit(type)
  }

  private searchComp = inject(CompanyService)
  group = this.searchComp.group
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
  isDn = computed(() => this.compType() === 'DN')
  changeDn = (changeToDn: boolean) => {
    if (changeToDn) {
      this.compTypeChange.emit('DN')
      this.group.set('DN')

    } else {
      this.compTypeChange.emit('HU')
      this.group.set('HU')
    }
  }
}
