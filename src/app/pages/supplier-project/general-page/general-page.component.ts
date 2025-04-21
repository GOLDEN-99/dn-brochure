import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BaseSupplierForm } from '../../../lib/supplier/baseForm';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-general-page',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './general-page.component.html',
  styleUrl: './general-page.component.scss'
})
export class GeneralPageComponent extends BaseSupplierForm {
  stepTwoForm = this.formService.form.controls.general
  addContact = this.formService.addGeneralContacForm
  removeContact = this.formService.removeGenralContactForm

  disable = () => !this.stepTwoForm.touched || this.stepTwoForm.invalid

  btnClass = () => this.disable()
    ? 'btn btn-primary w-100 disabled'
    : 'btn btn-primary w-100'

}
