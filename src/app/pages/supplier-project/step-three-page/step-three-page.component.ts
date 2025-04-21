import { Component } from '@angular/core';
import { BaseSupplierForm } from '../../../lib/supplier/baseForm';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-step-three-page',
  imports: [ReactiveFormsModule],
  templateUrl: './step-three-page.component.html',
  styleUrl: './step-three-page.component.scss'
})
export class StepThreePageComponent extends BaseSupplierForm {
  stepThree = this.formService.form.controls.stepThree
}
