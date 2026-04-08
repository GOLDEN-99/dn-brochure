import { Component, computed, inject, input, signal, viewChild } from '@angular/core';
import { TPopulatedPeriodResult } from '../../../../service/other-income/base-oi';
import { BasePeriodComponent } from '../base-period.component';
import { EditPeriodModalComponent } from '../edit-period-modal/edit-period-modal.component';
import { OtherIncomeOrderPeriodComponent } from '../other-income-order-period.component';
import { OtherIncomeGoodOrderPeriodComponent } from '../other-income-good-order-period.component';
import { OtherIncomeInvoicePeriodComponent } from '../other-income-invoice-period.component';
import { OtherIncomeReceiptPeriodComponent } from '../other-income-receipt-period.component';
import { OtherIncomeCreditPeriodComponent } from '../other-income-credit-period.component';
import { OtherIncomeOrderModalComponent } from '../other-income-order-modal/other-income-order-modal.component';
import { OtherIncomeGoodOrderModalComponent } from '../other-income-good-order-modal/other-income-good-order-modal.component';
import { OtherIncomeInvoiceModalComponent } from '../other-income-invoice-modal.component';
import { OtherIncomeReceiptModalComponent } from '../other-income-receipt-modal.component';
import { OtherIncomeCreditModalComponent } from '../other-income-credit-modal.component';
import { formatLocalNumber } from '../../../../lib/formatter';
import { PeriodStatus, TFieldSelector } from '../../../../types';
import { PeriodService } from '../../../../service/other-income/period.service';
import { TIncome } from '../../../../service/other-income/income.service';

@Component({
  selector: 'app-other-income-period-display',
  imports: [
    EditPeriodModalComponent,
    OtherIncomeOrderPeriodComponent,
    OtherIncomeGoodOrderPeriodComponent,
    OtherIncomeInvoicePeriodComponent,
    OtherIncomeReceiptPeriodComponent,
    OtherIncomeCreditPeriodComponent,
    OtherIncomeOrderModalComponent,
    OtherIncomeGoodOrderModalComponent,
    OtherIncomeInvoiceModalComponent,
    OtherIncomeReceiptModalComponent,
    OtherIncomeCreditModalComponent,
  ],
  templateUrl: './other-income-period-display.component.html',
  styleUrl: './other-income-period-display.component.scss'
})
export class OtherIncomePeriodDisplayComponent extends BasePeriodComponent {
  // Service injection
  private readonly periodService = inject(PeriodService);

  // Inputs
  possibleIncome = input.required<TIncome[]>()
  period = input.required<TPopulatedPeriodResult>();
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

  activeChangeToRece = computed(() => {
    const period = this.period();
    const { periodStatus, creditList, invoiceList } = period
    const { hasType3, hasType4 } = this.incomeTypes()
    return periodStatus === 3
      && (
        (hasType4 && creditList.length !== 0)
        || (hasType3 && invoiceList.length !== 0)
      );
  })

  activeChangeToComplete = computed(() => {
    const period = this.period();
    const { periodStatus, receiptList } = period
    return periodStatus === 4 && receiptList.length !== 0
  })

  disableAddInv = computed(() => {
    const period = this.period();
    const stat = period.periodStatus
    return stat !== 3
  })

  disableAddReceipt = computed(() => {
    const period = this.period();
    const stat = period.periodStatus
    return stat !== 4
  })

  isComplete = computed(() => {
    return this.period().periodStatus === PeriodStatus.Complete;
  })

  // Signals for status change loading states
  changingToRece = signal(false);
  changingToComplete = signal(false);
  deleting = signal(false);

  // ViewChild for modals
  private readonly editModal = viewChild('editPeriodModal');
  private readonly confirmReceModal = viewChild('confirmReceModal');
  private readonly confirmCompleteModal = viewChild('confirmCompleteModal');
  private readonly confirmDeleteModal = viewChild('confirmDeleteModal');
  private readonly orderPoModal = viewChild('orderPoModal');
  private readonly goodOrderPoModal = viewChild('goodOrderPoModal');
  private readonly invoiceModal = viewChild('invoiceModal');
  private readonly creditModal = viewChild('creditModal');
  private readonly receiptModal = viewChild('receiptModal');

  /**
   * Change period status to "Waiting for Receipt" (4)
   * Opens confirmation modal before making API call
   */
  changeToRece() {
    this.openModal(this.confirmReceModal(), 'md');
  }

  /**
   * Confirm and execute change to Receipt status
   */
  confirmChangeToRece() {
    this.changingToRece.set(true);

    this.periodService.updatePeriodStatus(
      this.period().id,
      PeriodStatus.Receipt
    ).subscribe({
      next: (result) => {
        this.changingToRece.set(false);
        if (result.affectedRows === 1) {
          this.onSuccess('เปลี่ยนสถานะเป็น "รอเพิ่มใบเสร็จรับเงิน" สำเร็จ');
        } else {
          this.onFail('เปลี่ยนสถานะไม่สำเร็จ');
        }
      },
      error: () => {
        this.changingToRece.set(false);
        this.onFail('เกิดข้อผิดพลาดในการเปลี่ยนสถานะ');
      }
    });
  }

  /**
   * Change period status to "Complete" (2)
   * Opens confirmation modal before making API call
   */
  changeToComplete() {
    this.openModal(this.confirmCompleteModal(), 'md');
  }

  /**
   * Confirm and execute change to Complete status
   */
  confirmChangeToComplete() {
    this.changingToComplete.set(true);

    this.periodService.updatePeriodStatus(
      this.period().id,
      PeriodStatus.Complete
    ).subscribe({
      next: (result) => {
        this.changingToComplete.set(false);
        if (result.affectedRows === 1) {
          this.onSuccess('เปลี่ยนสถานะเป็น "สำเร็จ" สำเร็จ');
        } else {
          this.onFail('เปลี่ยนสถานะไม่สำเร็จ');
        }
      },
      error: () => {
        this.changingToComplete.set(false);
        this.onFail('เกิดข้อผิดพลาดในการเปลี่ยนสถานะ');
      }
    });
  }

  // Signals for edit modal two-way binding
  editPeriodName = signal('');
  editPeriodRemark = signal('');

  // Selector arrays
  private readonly periodOrderSelector: TFieldSelector<TPopulatedPeriodResult>[] = [
    { label: 'ยอดซื้อ', fn: v => formatLocalNumber(v.totalAmount) },
    { label: 'รายได้', fn: v => formatLocalNumber(v.totalIncome) },
    { label: 'ส่วนลดบิล', fn: v => formatLocalNumber(v.billDiscountAmount) },
    { label: 'ของแถม', fn: v => formatLocalNumber(v.freeItemAmount) },
  ];

  private readonly periodReceSelector: TFieldSelector<TPopulatedPeriodResult>[] = [
    { label: 'ยอดซื้อ', fn: v => formatLocalNumber(v.totalAmount) },
    { label: 'รายได้', fn: v => formatLocalNumber(v.totalIncome) },
    { label: 'ยอดใบแจ้งหนี้', fn: v => formatLocalNumber(v.invAmount) },
    { label: 'ยอดใบเสร็จ', fn: v => formatLocalNumber(v.receAmount) },
  ];

  private readonly periodCreditSelector: TFieldSelector<TPopulatedPeriodResult>[] = [
    { label: 'ยอดซื้อ', fn: v => formatLocalNumber(v.totalAmount) },
    { label: 'รายได้', fn: v => formatLocalNumber(v.totalIncome) },
    { label: 'ยอดใบลดหนี้', fn: v => formatLocalNumber(v.creditAmount) },
  ];

  // Computed selector based on possible income types
  headerSelector = computed(() => {
    const { hasType1, hasType2, hasType3, hasType4 } = this.incomeTypes()
    if (hasType3) return this.periodReceSelector;
    if (hasType4) return this.periodCreditSelector;
    if (hasType1 || hasType2) return this.periodOrderSelector;
    return [];
  });

  sectionHeader = computed(() => {
    const { totalAmount, totalIncome, billDiscountAmount, freeItemAmount, creditAmount, invAmount, receAmount } = this.period();
    const { hasType3, hasType4 } = this.incomeTypes()
    const eventType = this.enventType() ?? 3
    const incomeSourceDetail = eventType === 3
      ? [{ label: 'รายได้', value: formatLocalNumber(totalIncome) }]
      : [{ label: 'ยอดซื้อ', value: formatLocalNumber(totalAmount) }, { label: 'รายได้', value: formatLocalNumber(totalIncome) }]
    const incomeDetail = this.possibleIncome().flatMap(({ incomeType }: { incomeType: number }) => {
      switch (incomeType) {
        case 1: return [{ label: 'ส่วนลดบิล', value: formatLocalNumber(billDiscountAmount) }]
        case 2: return [{ label: 'ของแถม', value: formatLocalNumber(freeItemAmount) }]
        case 3: return [{ label: 'ยอดใบแจ้งหนี้', value: formatLocalNumber(invAmount) }]
        case 4: return [{ label: 'ยอดใบลดหนี้', value: formatLocalNumber(creditAmount) }]
        default: return []
      }
    })
    const rece = hasType3 || hasType4 ? [{ label: 'ยอดใบเสร็จ', value: formatLocalNumber(receAmount) }] : []
    return [...incomeSourceDetail, ...incomeDetail, ...rece]
  })

  // Open edit modal
  openEditModal() {
    this.editPeriodName.set(this.period().periodName);
    this.editPeriodRemark.set(this.period().periodRemark);
    this.openModal(this.editModal());
  }

  openDeleteModal() {
    this.openModal(this.confirmDeleteModal(), 'md');
  }

  confirmDeletePeriod() {
    this.deleting.set(true);
    this.periodService.deletePeriod(this.period().id).subscribe({
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

  openOrderPo() { this.openModal(this.orderPoModal(), 'xl'); }
  openGoodOrderPo() { this.openModal(this.goodOrderPoModal(), 'xl'); }
  openInvoice() { this.openModal(this.invoiceModal()); }
  openCredit() { this.openModal(this.creditModal()); }
  openReceipt() { this.openModal(this.receiptModal()); }
}
