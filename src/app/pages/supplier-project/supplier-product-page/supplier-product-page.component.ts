import { Component, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ModalLayoutComponent } from "../../../components/modal/modal-layout/modal-layout.component";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-supplier-product-page',
  imports: [FormsModule, ModalLayoutComponent],
  templateUrl: './supplier-product-page.component.html',
  styleUrl: './supplier-product-page.component.scss'
})
export class SupplierProductPageComponent {
  mock = signal<TMock[]>([{ name: 'test product 1', code: '1234', shipTo: true, cancelShipTo: false, supReturn: true, supLot: true, supBox: true, branchReturn: false, branchLot: false, branchBox: false }])

  updateField = <K extends keyof TMock>(key: K, idx: number) => (value: TMock[K]) => this.mock.update((prev) => prev.map((p, i) => i === idx ? ({ ...p, [key]: value }) : p))

  private productModal = viewChild('productModal')
  private modalService = inject(NgbModal)
  openProductModal = () => this.modalService.open(this.productModal(), {})

}

type TMock = {
  name: string
  code: string
  shipTo: boolean
  cancelShipTo: boolean
  supReturn: boolean
  supLot: boolean
  supBox: boolean
  branchReturn: boolean
  branchLot: boolean
  branchBox: boolean
}
