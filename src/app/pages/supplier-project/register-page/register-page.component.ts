import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { SupplierFromService } from '../../../service/supplier/supplier-from.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { StepThreePageComponent } from "../step-three-page/step-three-page.component";
import { GeneralPageComponent } from "../general-page/general-page.component";
import { AuthPageComponent } from "../auth-page/auth-page.component";
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ConditionPageComponent } from "../condition-page/condition-page.component";
import { SupplierApiService } from '../../../service/supplier/supplier-api.service';
import { ToastService } from '../../../service/toast/toast.service';
import { tap } from 'rxjs';

@Component({
  selector: 'app-register-page',
  imports: [FormsModule, StepThreePageComponent, GeneralPageComponent, AuthPageComponent, RouterLink, ConditionPageComponent],
  templateUrl: './register-page.component.html',
  styleUrl: './register-page.component.scss'
})
export class RegisterPageComponent {
  // private supplierService = inject(SupplierApiService)
  private formService = inject(SupplierFromService)
  formData = this.formService.formState

  // ngOnInit(): void {
  //   this.supplierService.selectedCode$.pipe(
  //     tap()
  //   )
  //   const compCode = this.supplierService.selectedCode()
  //   this.formData.update(prev => ({ ...prev, compCode }))
  // }

  disable = computed(() => {
    const cur = this.formData()
    // return cur.compGroupCode === '' || cur.compName === '' || cur.username === '' || cur.username === ''
    return false
  })

  disableClass = computed(() => this.disable() ? "btn btn-primary w-100 disabled" : "btn btn-primary w-100")

  private ibobApi = inject(SupplierApiService)
  private router = inject(Router)
  private route = inject(ActivatedRoute)
  navigateComplete() {
    this.router.navigate(['..', 'complete'], { relativeTo: this.route })
  }
  private toast = inject(ToastService)
  compType = this.ibobApi.compType
  onSubmit() {
    switch (this.compType) {
      case 'DN':
        const dnReq = this.formService.DNReq
        const dnItem = this.formService.DNItem
        this.ibobApi.createDnSupplier(dnReq, dnItem).subscribe({
          next: (res) => {
            this.toast.success('เพิ่มสำเร็จ');
            this.navigateComplete()
            this.formService.resetForm()
            this.ibobApi.refetch()
          },
          error: (err) => {
            this.toast.danger(String(err));
          }
        })
        break;
      case 'HU':
        const huReq = this.formService.HUReq
        const huItem = this.formService.HUItem
        this.ibobApi.createHuSupplier(huReq, huItem).subscribe({
          next: (res) => {
            this.toast.success('เพิ่มสำเร็จ');
            this.navigateComplete()
            this.formService.resetForm()
            this.ibobApi.refetch()
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
  disableSubmit = this.formService.disableSubmit
}
