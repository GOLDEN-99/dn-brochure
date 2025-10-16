import { Component, computed, inject, signal } from '@angular/core';
import { StockItemApiService } from '../../../service/stock-item/stock-item-api.service';
import { TMaybe, TStockSetup } from '../../../types';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../../service/toast/toast.service';

@Component({
  selector: 'app-stock-item-home',
  imports: [FormsModule],
  templateUrl: './stock-item-home.component.html',
  styleUrl: './stock-item-home.component.scss'
})
export class StockItemHomeComponent {
  private toast = inject(ToastService)
  private stockItemServ = inject(StockItemApiService)
  setupList = this.stockItemServ.setup
  private initialValue = { riskPercent: 0, stockMonth: 0 }
  readOnly = signal(true)
  toggleReadOnly = () => this.readOnly.update(prev => !prev)
  private _invalidUpdate: TValidator<TMaybe<Omit<TStockSetup, 'id'>>>[] = [
    {
      validator: (v) => v !== null && isNaN(Number(v.riskPercent)),
      message: "risk percent is not a number"
    },
    {
      validator: (v) => v !== null && isNaN(Number(v.stockMonth)),
      message: "stock month is not a number"
    },
    {
      validator: (v) => v !== null && Number(v.stockMonth) < 0,
      message: "stock month must be greater than 0"
    },
  ]
  openEdit(req: TStockSetup) {
    this.closeAddForm()
    this.updateState.set(req)
  }

  // insert new criteria
  isCreate = signal(false)
  formState = signal<Omit<TStockSetup, 'id'>>(this.initialValue)
  updateFormPercent = (riskPercent: number) => this.formState.update(prev => ({ ...prev, riskPercent }))
  updateFormMonth = (stockMonth: number) => this.formState.update(prev => ({ ...prev, stockMonth }))
  alertCreateForm = computed(() => this._invalidUpdate.flatMap(({ validator, message }) => validator(this.formState()) ? [message] : []))
  disableCreate = computed(() => this.alertCreateForm().length !== 0)
  closeAddForm = () => {
    this.isCreate.set(false)
    this.formState.set(this.initialValue)
  }

  // update new creteria
  updateState = signal<TMaybe<TStockSetup>>(null)
  updateMonth = (v: number) => this.updateState.update(prev => prev !== null ? ({ ...prev, stockMonth: v }) : prev)
  updatePercent = (v: number) => this.updateState.update(prev => prev !== null ? ({ ...prev, riskPercent: v }) : prev)
  alertUpdateForm = computed(() => this._invalidUpdate.flatMap(({ validator, message }) => validator(this.updateState()) ? [message] : []))
  disableUpdate = computed(() => this.alertUpdateForm().length !== 0)

  disableAdd = computed(() => this.updateState() !== null || this.isCreate())

  onCreate = () => {
    const raw = this.formState()
    const stockMonth = Number(raw.stockMonth)
    const riskPercent = Number(raw.riskPercent)
    if (isNaN(stockMonth) || isNaN(riskPercent)) {
      this.toast.danger("ข้อมูลไม่ถูกต้อง")
      return
    }
    this.stockItemServ.addSetup({ stockMonth, riskPercent }).subscribe({
      next: () => {
        this.toast.success("เพิ่มสำเร็จ")
        this.closeAddForm()
      },
      error: (err) => {
        this.toast.danger(String(err))
      }
    })
  }

  onUpdate = () => {
    const raw = this.updateState()
    const stockMonth = Number(raw?.stockMonth)
    const riskPercent = Number(raw?.riskPercent)
    const id = Number(raw?.id)
    if (isNaN(stockMonth) || isNaN(riskPercent) || isNaN(id)) {
      this.toast.danger("ข้อมูลไม่ถูกต้อง")
      return
    }
    this.stockItemServ.updateSetup({ id, stockMonth, riskPercent }).subscribe({
      next: () => {
        this.toast.success("แก้ไขสำเร็จ")
        this.updateState.set(null)
      },
      error: (err) => {
        this.toast.danger(String(err))
      }
    })
  }

  onDelete = (id: number) => this.stockItemServ.deleteSetup(id).subscribe({
    next: () => this.toast.success('ลำเสร็จ'),
    error: (err) => this.toast.danger(String(err))
  })
}

type TValidator<T> = {
  validator: (value: T) => boolean
  message: string
}
