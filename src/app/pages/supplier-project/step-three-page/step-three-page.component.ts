import { Component, inject, TemplateRef } from '@angular/core';
import { BaseSupplierForm } from '../../../lib/supplier/baseForm';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ModalLayoutComponent } from "../../../components/modal/modal-layout/modal-layout.component";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SearchSupplierComponent } from "../../../components/inbound-outbound/search-supplier/search-supplier.component";

@Component({
  selector: 'app-step-three-page',
  imports: [ReactiveFormsModule, ModalLayoutComponent, SearchSupplierComponent],
  templateUrl: './step-three-page.component.html',
  styleUrl: './step-three-page.component.scss'
})
export class StepThreePageComponent extends BaseSupplierForm {
  stepThree = this.formService.form.controls.stepThree
  addEmpl = this.formService.addEmplList
  removeEmpl = this.formService.removeEmplList
  protected modalService = inject(NgbModal)
  openModal(modal: TemplateRef<any>) {
    this.modalService.open(modal)
  }
}
