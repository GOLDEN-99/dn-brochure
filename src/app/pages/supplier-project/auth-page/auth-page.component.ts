import { Component, computed, signal } from '@angular/core';
import { BaseSupplierForm } from '../../../lib/supplier/baseForm';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-auth-page',
  imports: [ReactiveFormsModule],
  templateUrl: './auth-page.component.html',
  styleUrl: './auth-page.component.scss'
})
export class AuthPageComponent extends BaseSupplierForm {
  stepOneForm = this.formService.form.controls.auth
  disable = () => this.stepOneForm.invalid || !this.stepOneForm.touched
  passwordType = signal<'text' | 'password'>('password')

  togglePassword = () => this.passwordType.update(prev => prev === 'password' ? 'text' : 'password')

}
