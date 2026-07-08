import { NgbDateStruct } from "@ng-bootstrap/ng-bootstrap";

export const ngbDateToIso = ({ day, month, year }: NgbDateStruct) => `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`

export const isoToNgbDate = (iso: string): NgbDateStruct => {
  const [year, month, day] = iso.split('-').map(Number);
  return { year, month, day };
}

const toIsoDate = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

export const startOfYearRange = () => {
  const now = new Date();
  return {
    startDate: toIsoDate(new Date(now.getFullYear(), 0, 1)),
    endDate: toIsoDate(new Date(now.getFullYear(), 11, 31)),
  };
}

export const startOfMonthRange = () => {
  const now = new Date();
  return {
    startDate: toIsoDate(new Date(now.getFullYear(), now.getMonth(), 1)),
    endDate: toIsoDate(new Date(now.getFullYear(), now.getMonth() + 1, 0)),
  };
}