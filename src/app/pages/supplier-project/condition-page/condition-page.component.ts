import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { BaseSupplierForm } from '../../../lib/supplier/baseForm';
import { ReactiveFormsModule } from '@angular/forms';
import { TReturnForm } from '../../../service/supplier/supplier-from.service';
import { SupplierApiService } from '../../../service/supplier/supplier-api.service';
import { ToastService } from '../../../service/toast/toast.service';

@Component({
  selector: 'app-condition-page',
  imports: [NgbNavModule, RouterLink, ReactiveFormsModule, RouterLink],
  templateUrl: './condition-page.component.html',
  styleUrl: './condition-page.component.scss'
})
export class ConditionPageComponent extends BaseSupplierForm {

  active = signal(1)

  form = this.formService.form.controls.condi
  private ibobApi = inject(SupplierApiService)
  private router = inject(Router)
  navigateComplete() {
    this.router.navigate(['..', 'complete'], { relativeTo: this.route })
  }

  addSup = this.formService.addCondi("sup")
  removeSup = this.formService.removeCondi("sup")

  addBranch = this.formService.addCondi("stk")
  removeBranch = this.formService.removeCondi("stk")

  get supForm(): TReturnForm | null {
    return this.form.get('sup') as any as TReturnForm;
  }
  get branchForm(): TReturnForm | null {
    return this.form.get('stk') as any as TReturnForm;
  }
  private toast = inject(ToastService)
  onSubmit() {

    const compType = this.compType()
    switch (compType) {
      case 'DN':
        const dnReq = this.formService.DNReq
        this.ibobApi.createDnSupplier(dnReq, []).subscribe({
          next: (res) => {
            this.toast.success('เพิ่มสำเร็จ');
            this.navigateComplete()
          },
          error: (err) => {
            this.toast.danger(String(err));
          }
        })
        break;
      case 'HU':
        const huReq = this.formService.HUReq
        this.ibobApi.createHuSupplier(huReq, []).subscribe({
          next: (res) => {
            this.toast.success('เพิ่มสำเร็จ');
            this.navigateComplete()
          },
          error: (err) => {
            this.toast.danger(String(err));
          }
        })
        break;
      default:
        break;
    }
  }

}
