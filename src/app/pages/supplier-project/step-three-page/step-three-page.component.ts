import { Component } from '@angular/core';
import { BaseSupplierForm } from '../../../lib/supplier/baseForm';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-step-three-page',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './step-three-page.component.html',
  styleUrl: './step-three-page.component.scss'
})
export class StepThreePageComponent extends BaseSupplierForm {
  stepThree = this.formService.form.controls.stepThree
  addEmpl = this.formService.addEmplList
  removeEmpl = this.formService.removeEmplList

}
