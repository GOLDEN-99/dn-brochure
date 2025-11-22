import { Component, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../../../service/api/api.service';
import { environment } from '../../../../../environments/environment';
import { ToastService } from '../../../../service/toast/toast.service';

@Component({
  selector: 'app-other-income-light-form',
  imports: [FormsModule],
  template: `  
  <!-- special target -->
  <div class="row">
    <div class="col app-form-field">
      <label for="target-branch">เป้าหมายสาขา</label>
      <input
        type="number"
        id="target-branch"
        name="target-branch"
        [(ngModel)]="target"
      />
    </div>
    <div class="col app-form-field">
      <label for="target-amount">ยอด (บาท)</label>
      <input
        type="number"
        id="target-amount"
        name="target-amount"
        [(ngModel)]="targetAmount"/>
    </div>
  </div>
  <div class="d-flex justify-content-center" style="gap: 1rem">
  <button class="btn btn-success" (click)="onSubmit()">
    <i class="bi bi-floppy"></i>
    <span> บันทึก </span>
  </button>
  <!-- <a routerLink="../" class="btn btn-outline-danger"
    >ย้อนกลับ</a
  > -->
</div>
  `,
  styles: ``
})
export class OtherIncomeLightFormComponent {
  headId = input<number>()
  target = signal(0)
  targetAmount = signal(0)

  private router = inject(Router)
  private route = inject(ActivatedRoute)
  private toastService = inject(ToastService)

  private api = inject(ApiService)
  private url = environment.oi
  onSubmit() {
    const req = this.request
    this.api.post(`${this.url}/other-income/contact/light/${this.headId()}`, req).subscribe({
      next: (res) => {
        this.toastService.success('เพิ่มรายได้อื่นๆ สำเร็จ')
        this.router.navigate(['../../'], { relativeTo: this.route })
      },
      error: (err) => {
        this.toastService.danger(`${err.message}`)
      }
    })
  }
  get request() {
    const totalBranch = this.target()
    const totalAmount = this.targetAmount()
    return { totalBranch, totalAmount }
  }
}
