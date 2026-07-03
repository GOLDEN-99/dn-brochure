import { Component, computed, inject, input, output, signal, viewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { OtherIncomeAccountPeriodService } from '../../../account/services/other-income-account-period.service';
import { OtherIncomePurchasePeriodService } from '../../../purchase/services/other-income-purchase-period.service';
import { TIncome } from './period-display.type';
import { formatLocalNumber } from '../../../../lib/formatter';
import { CreateCreditNoteComponent } from "../../../account/components/form/create-credit-note/create-credit-note.component";
import { CreateReceiptComponent } from "../../../account/components/form/create-receipt/create-receipt.component";
import { CreateInvoiceComponent } from "../../../account/components/form/create-invoice/create-invoice.component";
import { OtherIncomeInvoiceReceiptComponent } from "../../../account/components/other-income-invoice-receipt/other-income-invoice-receipt.component";
import { EditPeriodModalComponent } from "../edit-period-modal/edit-period-modal.component";
import { TSettlementDetail } from '../../types/other-income.type';

@Component({
  selector: 'other-income-period-display',
  imports: [
    CreateCreditNoteComponent, CreateReceiptComponent, CreateInvoiceComponent,
    OtherIncomeInvoiceReceiptComponent,
    EditPeriodModalComponent
  ],
  templateUrl: './period-display.component.html',
  styleUrl: './period-display.component.scss',
})
export class PeriodDisplayComponent {
  // Outputs (previously provided by BasePeriodComponent)
  success = output<string>()
  fail = output<string>()
  private readonly modalServ = inject(NgbModal)

  protected openModal(modalRef: any, size: string = 'lg') {
    return this.modalServ.open(modalRef, { size });
  }

  onSuccess(value: string): void {
    this.modalServ.dismissAll();
    this.success.emit(value);
  }

  onFail(value: string): void {
    this.modalServ.dismissAll();
    this.fail.emit(value);
  }

  // Service injection
  private readonly accountPeriodService = inject(OtherIncomeAccountPeriodService);
  private readonly purchasePeriodService = inject(OtherIncomePurchasePeriodService)
  // Inputs
  possibleIncome = input.required<TIncome[]>()
  period = input.required<TSettlementDetail>();
  canEdit = input.required<boolean>();
  isPurchase = input.required<boolean>();
  compCode = input.required<string | undefined>();
  compType = input.required<string | undefined>();
  enventType = input<number>()

  readonly incomeTypes = computed(() => {
    const list = this.possibleIncome();
    return {
      hasType1: list.some(i => i.incomeType === 1),
      hasType2: list.some(i => i.incomeType === 2),
      hasType3: list.some(i => i.incomeType === 3),
      hasType4: list.some(i => i.incomeType === 4),
    }
  })

  invoiceAmount = computed(() => this.period().invoices.reduce((acc, { invoiceAmount }) => acc + invoiceAmount, 0))
  receiptAmount = computed(() => this.period().receipts.reduce((acc, { receAmount }) => acc + receAmount, 0))
  freeAmount = computed(() => this.period().freeItems.reduce((acc, { subtotalAmount }) => acc + subtotalAmount, 0))
  billDiscountAmount = computed(() => this.period().billDiscounts.reduce((acc, { subtotalAmount }) => acc + subtotalAmount, 0))
  creditNoteAmount = computed(() => this.period().creditNotes.reduce((acc, { creditAmount }) => acc + creditAmount, 0))

  invoiceMatched = computed(() => {
    const { matches } = this.period()
    const ref = new Map<number, number>()
    for (const record of matches) {
      const saved = ref.get(record.invoiceId) ?? 0
      ref.set(record.invoiceId, saved + record.matchedAmount)
    }
    return ref
  })
  matchedAmount = computed(() => this.period().matches.reduce((acc, { matchedAmount }) => acc + matchedAmount, 0))

  remainingInvoice = computed(() => this.receiptAmount() - this.matchedAmount())

  remainingIncome = computed(() => this.period().supplierIncome - this.freeAmount() - this.billDiscountAmount() - this.invoiceAmount() - this.creditNoteAmount())

  disableAddInv = computed(() => this.remainingInvoice() <= 0)

  disableAddReceipt = computed(() => this.matchedAmount() >= this.invoiceAmount())



  deleting = signal(false);

  // ViewChild for modals
  private readonly editModal = viewChild('editPeriodModal');
  private readonly confirmDeleteModal = viewChild('confirmDeleteModal');
  private readonly invoiceModal = viewChild('invoiceModal');
  private readonly creditModal = viewChild('creditModal');
  private readonly receiptModal = viewChild('receiptModal');

  // Signals for edit modal two-way binding
  editPeriodName = signal('');
  editPeriodRemark = signal('');

  sectionHeader = computed(() => {
    const { supplierIncome, supplierOrderAmount } = this.period();
    const { hasType3, hasType4 } = this.incomeTypes()
    const eventType = this.enventType() ?? 3
    const incomeSourceDetail = eventType === 3
      ? [{ label: 'รายได้', value: formatLocalNumber(supplierIncome) }]
      : [{ label: 'ยอดซื้อ', value: formatLocalNumber(supplierOrderAmount ?? 0) }, { label: 'รายได้', value: formatLocalNumber(supplierIncome) }]
    const incomeDetail = this.possibleIncome().flatMap(({ incomeType }: { incomeType: number }) => {
      switch (incomeType) {
        case 1: return [{ label: 'ส่วนลดบิล', value: formatLocalNumber(this.billDiscountAmount()) }]
        case 2: return [{ label: 'ของแถม', value: formatLocalNumber(this.freeAmount()) }]
        case 3: return [{ label: 'ยอดใบแจ้งหนี้', value: formatLocalNumber(this.invoiceAmount()) }]
        case 4: return [{ label: 'ยอดใบลดหนี้', value: formatLocalNumber(this.creditNoteAmount()) }]
        default: return []
      }
    })
    const rece = hasType3 || hasType4 ? [{ label: 'ยอดใบเสร็จ', value: formatLocalNumber(this.receiptAmount()) }] : []
    return [...incomeSourceDetail, ...incomeDetail, ...rece]
  })

  // Open edit modal
  openEditModal() {
    this.editPeriodName.set(this.period().periodName);
    this.editPeriodRemark.set(this.period().remark ?? '');
    this.openModal(this.editModal());
  }

  openDeleteModal() {
    this.openModal(this.confirmDeleteModal(), 'md');
  }

  confirmDeletePeriod() {
    this.deleting.set(true);
    this.accountPeriodService.deletePeriod(this.period().id).subscribe({
      next: () => {
        this.deleting.set(false);
        this.onSuccess('ลบข้อมูลสำเร็จ');
      },
      error: () => {
        this.deleting.set(false);
        this.onFail('เกิดข้อผิดพลาดในการลบข้อมูล');
      }
    });
  }

  openInvoice() { this.openModal(this.invoiceModal()); }
  openCredit() { this.openModal(this.creditModal()); }
  openReceipt() { this.openModal(this.receiptModal()); }
}
