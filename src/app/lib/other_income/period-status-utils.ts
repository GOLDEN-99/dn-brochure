import { PeriodStatus } from '../../types/other-income';

/**
 * Maps period status code to Thai label
 */
export function getPeriodStatusLabel(status: PeriodStatus | null | undefined): string {
  switch (status) {
    case PeriodStatus.Complete:
      return 'สำเร็จ';
    case PeriodStatus.Invoice:
      return 'รอเพิ่มใบแจ้งหนี้';
    case PeriodStatus.Receipt:
      return 'รอเพิ่มใบเสร็จ';
    default:
      return '-';
  }
}

/**
 * Maps period status code to Bootstrap badge class
 * Green (success) = Complete
 * Blue (primary) = Waiting for invoice
 * Yellow (warning) = Waiting for receipt
 */
export function getPeriodStatusBadgeClass(status: PeriodStatus | null | undefined): string {
  switch (status) {
    case PeriodStatus.Complete:
      return 'badge bg-success';
    case PeriodStatus.Invoice:
      return 'badge bg-primary';
    case PeriodStatus.Receipt:
      return 'badge bg-warning';
    default:
      return 'badge bg-secondary';
  }
}

/**
 * Formats amount progress display
 * Example: "8,000.00 / 10,000.00 บาท"
 */
export function formatAmountProgress(current: number, total: number): string {
  const formatNum = (n: number) => n.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  return `${formatNum(current)} / ${formatNum(total)} บาท`;
}
