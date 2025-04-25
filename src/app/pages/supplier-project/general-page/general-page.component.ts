import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BaseSupplierForm } from '../../../lib/supplier/baseForm';

@Component({
  selector: 'app-general-page',
  imports: [ReactiveFormsModule],
  templateUrl: './general-page.component.html',
  styleUrl: './general-page.component.scss'
})
export class GeneralPageComponent extends BaseSupplierForm {
  stepTwoForm = this.formService.form.controls.general
  addContact = this.formService.addGeneralContacForm
  removeContact = this.formService.removeGenralContactForm
}
