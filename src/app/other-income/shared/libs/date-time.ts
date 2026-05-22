import { NgbDateStruct } from "@ng-bootstrap/ng-bootstrap";

export const ngbDateToIso = ({ day, month, year }: NgbDateStruct) => `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`