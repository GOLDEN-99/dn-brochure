import { Component, computed, inject, signal } from '@angular/core';
import { SupplierFromService } from '../../../service/supplier/supplier-from.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { StepThreePageComponent } from "../step-three-page/step-three-page.component";
import { GeneralPageComponent } from "../general-page/general-page.component";
import { AuthPageComponent } from "../auth-page/auth-page.component";
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-register-page',
  imports: [FormsModule, StepThreePageComponent, GeneralPageComponent, AuthPageComponent, RouterLink],
  templateUrl: './register-page.component.html',
  styleUrl: './register-page.component.scss'
})
export class RegisterPageComponent {
  private formService = inject(SupplierFromService)
  formData = this.formService.formState

  disable = computed(() => {
    const cur = this.formData()
    // return cur.compGroupCode === '' || cur.compName === '' || cur.username === '' || cur.username === ''
    return false
  })

  disableClass = computed(() => this.disable() ? "btn btn-primary w-100 disabled" : "btn btn-primary w-100")
}
