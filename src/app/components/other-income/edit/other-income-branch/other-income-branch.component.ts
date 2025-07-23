import { Component, computed, effect, inject, input, OnDestroy, OnInit, signal, viewChild } from '@angular/core';
import { NgbCalendar, NgbDate, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TBranchItem } from '../../../../service/other-income/base-oi';
import { DatePipe } from '@angular/common';
import { DateInputComponent } from "../../../date-input/date-input.component";
import { FormsModule } from '@angular/forms';
import { BranchService } from '../../../../service/other-income/branch.service';
import { MonthlyService } from '../../../../service/other-income/monthly.service';
import { ToastService } from '../../../../service/toast/toast.service';
import { OiLightService } from '../../../../service/other-income/oi-light.service';

@Component({
  selector: 'app-other-income-branch',
  imports: [DatePipe, DateInputComponent, FormsModule],
  templateUrl: './other-income-branch.component.html',
  styleUrl: './other-income-branch.component.scss'
})
export class OtherIncomeBranchComponent implements OnInit, OnDestroy {
  private branchSet = new Set<string>()
  ngOnInit(): void {
    this.branchList().forEach(({ branchCode }) => this.branchSet.add(branchCode))
  }
  ngOnDestroy(): void {
    this.branchSet.clear();
  }
  lightId = input.required<number>()
  branchList = input<TBranchItem[]>([])
  private toastServ = inject(ToastService)
  private branchModal = viewChild('branchModal')
  private modalService = inject(NgbModal)
  openModal() {
    this.modalService.open(this.branchModal())
  }
  private cal = inject(NgbCalendar)
  private today = this.cal.getToday()
  openDate = signal<NgbDate>(this.today)
  private branchServ = inject(BranchService)
  term = this.branchServ.term
  queryBranch = this.branchServ.queryBranch
  filteredBranch = computed(() => {
    const cont = this.branchList().length
    return this.queryBranch().filter(({ branchCode }) => this.branchSet.has(branchCode) === false)
  }
  )
  private lightServ = inject(OiLightService)
  private monthServ = inject(MonthlyService)
  addBranch(branchCode: string) {
    if (this.branchSet.has(branchCode)) {
      this.toastServ.danger('มีร้านนี้แล้ว')
      return
    }
    const lightId = this.lightId()
    const { year, month, day } = this.openDate()
    const iso = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    this.monthServ.insertBranch(lightId, branchCode, iso).subscribe({
      next: (res) => {
        this.toastServ.success('เพิ่มสาขาสำเร็จ')
        this.branchSet.add(branchCode)
        this.lightServ.refetch()
        this.modalService.dismissAll()
      },
      error: (err) => {
        this.toastServ.danger(err.message)
      }
    })
  }
  onDelete(branchId: number, branchCode: string) {
    this.monthServ.deleteBranch(branchId).subscribe(
      {
        next: () => {
          this.toastServ.success('ลบสำเร็จ')
          this.branchSet.delete(branchCode)
          this.lightServ.refetch()
        },
        error: (err) => {
          this.toastServ.danger(err.message)
        }
      }
    )
  }
}
