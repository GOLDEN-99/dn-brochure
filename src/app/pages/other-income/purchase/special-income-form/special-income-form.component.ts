import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { OtherIncomeBaseformComponent } from "../../../../components/other-income/form/other-income-baseform/other-income-baseform.component";
import { OiBaseformService } from '../../../../service/other-income/oi-baseform.service';
import { ToastService } from '../../../../service/toast/toast.service';

@Component({
  selector: 'app-special-income-form',
  imports: [FormsModule, RouterLink, OtherIncomeBaseformComponent],
  template: `
    <app-other-income-baseform (isLightChange)="eventType.set($event)" mode="light" />
    <!--  action -->
    <div class="d-flex justify-content-center" style="gap: 1rem">
      <button class="btn btn-success" (click)="onSubmit()" [disabled]="disable()">
        <i class="bi bi-floppy"></i>
        <span> บันทึก </span>
      </button>
      <a routerLink="../" class="btn btn-outline-danger">
        ย้อนกลับ
      </a>
    </div>
  `,
  styles: ''
})
export class SpecialIncomeFormComponent {
  private baseForm = inject(OiBaseformService)
  private router = inject(Router)
  private route = inject(ActivatedRoute)
  private toast = inject(ToastService)
  disableBaseForm = this.baseForm.disableLight
  eventType = signal(0)
  disableEvent = computed(() => this.eventType() !== 2)
  disable = computed(() => this.disableBaseForm() || this.disableEvent())
  onSubmit() {
    this.baseForm.createHead().subscribe({
      next: ({ id }) => {
        this.baseForm.resetForm()
        this.toast.success('เพิ่มหัวรายได้อื่นๆ สำเร็จ')
        this.router.navigate([id], { relativeTo: this.route })
      },
      error: (err) => {
        console.log(err)
        this.toast.danger(`${err.message}`)
      }
    })
  }
}
