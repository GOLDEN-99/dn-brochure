import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-supplier-product-page',
  imports: [FormsModule],
  templateUrl: './supplier-product-page.component.html',
  styleUrl: './supplier-product-page.component.scss'
})
export class SupplierProductPageComponent {
  mock = signal<TMock[]>([{ name: 'test product 1', code: '1234', shipTo: true, cancelShipTo: false, supReturn: true, supLot: true, supBox: true, branchReturn: false, branchLot: false, branchBox: false }])

  updateField = <K extends keyof TMock>(key: K, idx: number) => (value: TMock[K]) => this.mock.update((prev) => prev.map((p, i) => i === idx ? ({ ...p, [key]: value }) : p))

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
