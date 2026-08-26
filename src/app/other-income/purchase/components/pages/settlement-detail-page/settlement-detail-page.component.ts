import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { Location } from '@angular/common';
import { SettlementContextService } from '../../../services/settlement-context.service';
import { OtherIncomePurchaseApiService } from '../../../services/other-income-purchase-api.service';
import { ToastService } from '../../../../../service/toast/toast.service';
import { FOR_CONTRACT_DATA_TOKEN } from '../../../../tokens/service-token';
import { BALANCE_STATE_LABEL } from '../../../../shared/libs/settlement-labels';
import { floorSatang } from '../../../../shared/libs/money';
import { SettlementSummaryCardComponent } from './components/settlement-summary-card/settlement-summary-card.component';
import { SettlementBillTabComponent } from './components/settlement-bill-tab/settlement-bill-tab.component';
import { SettlementFreeItemTabComponent } from './components/settlement-free-item-tab/settlement-free-item-tab.component';
import { SettlementInvoiceReceiptTabComponent } from './components/settlement-invoice-receipt-tab/settlement-invoice-receipt-tab.component';
import { SettlementCreditNoteTabComponent } from './components/settlement-credit-note-tab/settlement-credit-note-tab.component';

type DocTab = 'bill' | 'freeItem' | 'invoice' | 'creditNote';

const INCOME_TYPE_TO_TAB: Partial<Record<string, DocTab>> = {
  Bill: 'bill',
  FreeItem: 'freeItem',
  Invoice: 'invoice',
  CreditNote: 'creditNote',
}

@Component({
  selector: 'app-settlement-detail-page',
  imports: [
    SettlementSummaryCardComponent,
    SettlementBillTabComponent,
    SettlementFreeItemTabComponent,
    SettlementInvoiceReceiptTabComponent,
    SettlementCreditNoteTabComponent,
  ],
  templateUrl: './settlement-detail-page.component.html',
  styleUrl: './settlement-detail-page.component.scss',
})
export class SettlementDetailPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute)
  private readonly router = inject(Router)
  private readonly location = inject(Location)
  private readonly toast = inject(ToastService)
  private readonly api = inject(OtherIncomePurchaseApiService)
  readonly ctx = inject(SettlementContextService)
  private readonly headService = inject(FOR_CONTRACT_DATA_TOKEN)

  isAccount = input(false)

  /**
   * GET /v2/settlements/{id} doesn't carry compCode/compType, so once the settlement loads
   * (giving us contractId/contractType), fetch the parent contract separately to get them.
   */
  private readonly contractComp = computed(() => {
    const head = this.headService.contract()
    if (!head) return null
    const { compCode, compType } = head
    return { compCode, compType }
  })

  /**
   * balanceState/remaining aren't returned by GET /v2/settlements/{id} (only by
   * GET /v2/settlements/overview) — compute the same formula client-side from
   * fields already on TSettlementDetail. Mirrors docs/api/settlement-api.md's
   * `remaining = supplierIncome - appendedTotal` / `OUTSTANDING if remaining > 1`.
   */
  balance = computed(() => {
    const settlement = this.ctx.settlement()
    if (!settlement) return null
    const appendedTotal =
      settlement.invoices.reduce((sum, row) => sum + row.invoiceAmount, 0) +
      settlement.creditNotes.reduce((sum, row) => sum + row.creditAmount, 0) +
      settlement.billDiscounts.reduce((sum, row) => sum + row.subtotalAmount, 0) +
      settlement.freeItems.reduce((sum, row) => sum + row.subtotalAmount, 0)
    // Floored: subtracting two satang-quantized floats still yields noise (0.3 - 0.1),
    // and `remaining` is the ceiling the invoice form validates against.
    const remaining = floorSatang(settlement.supplierIncome - appendedTotal)
    const state: 'OUTSTANDING' | 'SETTLED' = remaining > 1 ? 'OUTSTANDING' : 'SETTLED'
    return { remaining, state, label: BALANCE_STATE_LABEL[state] }
  })

  openSettlementAmount = computed(() => this.balance()?.remaining ?? 0)

  /** Which document-type tabs apply to this contract, per its agreed income types. */
  availableTabs = computed(() => {
    const incomeTypes = new Set(this.headService.contract()?.incomeTypes.map(t => t.incomeType) ?? [])
    const tabs: DocTab[] = []
    if (incomeTypes.has('Bill')) tabs.push('bill')
    if (incomeTypes.has('FreeItem')) tabs.push('freeItem')
    if (incomeTypes.has('Invoice')) tabs.push('invoice')
    if (incomeTypes.has('CreditNote')) tabs.push('creditNote')
    return tabs
  })

  private readonly queryParamMap = toSignal(this.route.queryParamMap, {
    initialValue: this.route.snapshot.queryParamMap,
  })

  /** Tab hinted by the `?incomeType=` param passed in from the worklist. */
  private readonly requestedTab = computed<DocTab | null>(() =>
    INCOME_TYPE_TO_TAB[this.queryParamMap().get('incomeType') ?? ''] ?? null
  )

  activeTab = signal<DocTab | null>(null)

  /**
   * Priority: explicit user click (activeTab) → worklist hint (requestedTab, if available) → first tab.
   * requestedTab is guarded against incomeTypes not on the contract.
   */
  currentTab = computed(() => {
    const active = this.activeTab()
    if (active) return active
    const requested = this.requestedTab()
    if (requested && this.availableTabs().includes(requested)) return requested
    return this.availableTabs()[0] ?? null
  })

  setTab(tab: DocTab): void {
    this.activeTab.set(tab)
  }

  searchBillDiscounts = (filters: Omit<Parameters<typeof this.api.searchBillDiscounts>[0], 'compType' | 'compCode'>) => {
    const comp = this.contractComp()
    if (!comp) throw new Error('Contract company info not loaded yet')
    return this.api.searchBillDiscounts({ ...filters, ...comp })
  }

  searchFreeProducts = (filters: Omit<Parameters<typeof this.api.searchFreeProducts>[0], 'compType' | 'compCode'>) => {
    const comp = this.contractComp()
    if (!comp) throw new Error('Contract company info not loaded yet')
    return this.api.searchFreeProducts({ ...filters, ...comp })
  }

  ngOnInit(): void {
    this.ctx.load(+this.route.snapshot.params['settlementId']);
  }

  onDeleteSettlement(): void {
    this.ctx.deleteSettlement().subscribe({
      next: () => {
        this.toast.success('ลบงวดชำระเรียบร้อย')
        this.headService.refreshChildren?.()
        this.router.navigate(['../'], { relativeTo: this.route })
      },
      error: (err) => this.toast.danger(err?.error?.error ?? 'เกิดข้อผิดพลาด'),
    })
  }
}
