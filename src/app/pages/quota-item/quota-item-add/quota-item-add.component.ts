import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TBaseProduct } from '../../../service/stock-item/stock-item-api.service';
import { TMaybe } from '../../../types';

@Component({
  selector: 'app-quota-item-add',
  imports: [FormsModule],
  templateUrl: './quota-item-add.component.html',
  styleUrl: './quota-item-add.component.scss'
})
export class QuotaItemAddComponent {
  private modalServ = inject(NgbModal)
  openSearchProductModal = (ref: any) => {
    this.modalServ.open(ref, { size: 'lg' });
  }
  modeList = [{ key: "barcode", label: 'รหัสสินค้า' }, { key: "goodName", label: "ชื่อสินค้า" }]
  mode = signal('barcode')
  onModeChange = (mode: string) => this.mode.set(mode);
  search = signal({ goodName: '', barcode: '' })
  searchName = (goodName: string) => this.search.update(prev => ({ ...prev, goodName }))
  searchCode = (goodCode: string) => this.search.update(prev => ({ ...prev, goodCode }))
  productList = signal<TBaseProduct[]>([])
  selectProduct = signal<TMaybe<TBaseProduct>>(null)
  onSelectProduct = (product: TBaseProduct) => {
    this.selectProduct.set(product)
    this.modalServ.dismissAll();
  }
  quotaAmount = signal(10_000)
  computedValue = computed(() => {
    const quotaAmount = this.quotaAmount()
    const oldWholeQuota = Math.floor(0.8 * quotaAmount)
    const totalWhole = Math.floor(0.6 * oldWholeQuota)
    const goodWhole = oldWholeQuota - totalWhole
    const remain = quotaAmount - oldWholeQuota
    const tempWholeQuota = Math.floor(0.75 * remain)
    const newWholeQuota = remain - tempWholeQuota
    return [
      {
        label: '80%',
        fieldName: 'oldWhole',
        value: oldWholeQuota,
        readOnly: true,
      },
      {
        label: '60% จาก 80%',
        fieldName: 'totalWhole',
        value: totalWhole,
        readOnly: false,
      },
      {
        label: '40% จาก 80% เฉพาะสินค้า',
        fieldName: 'goodWhole',
        value: goodWhole,
        readOnly: false,
      },
      {
        label: '15% ลูกค้าเก่า',
        fieldName: 'temp',
        value: tempWholeQuota,
        readOnly: false,
      },
      {
        label: '5% ลูกค้าใหม่',
        fieldName: 'newWhole',
        value: newWholeQuota,
        readOnly: false,
      },
    ]
  })
}


type TComputedRow = {
  label: string
  fieldName: string
  value: number
  readOnly: boolean
}