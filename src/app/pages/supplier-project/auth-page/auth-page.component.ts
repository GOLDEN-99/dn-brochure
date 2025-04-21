import { Component, computed, signal } from '@angular/core';
import { BaseSupplierForm } from '../../../lib/supplier/baseForm';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-auth-page',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './auth-page.component.html',
  styleUrl: './auth-page.component.scss'
})
export class AuthPageComponent extends BaseSupplierForm {
  stepOneForm = this.formService.form.controls.auth
  disable = () => this.stepOneForm.invalid || !this.stepOneForm.touched
  passwordType = signal<'text' | 'password'>('password')

  togglePassword = () => this.passwordType.update(prev => prev === 'password' ? 'text' : 'password')

  btnClass = () => this.disable()
    ? 'btn btn-primary w-100 disabled'
    : 'btn btn-primary w-100'

}
