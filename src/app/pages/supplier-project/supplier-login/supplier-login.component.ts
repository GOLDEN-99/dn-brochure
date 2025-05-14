import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastService } from '../../../service/toast/toast.service';
import { LOGINABLE_TOKEN } from '../../../service/ibob/ibobToken';
import { LoginService } from '../../../service/ibob/reserve/login.service';

@Component({
  selector: 'app-supplier-login',
  imports: [ReactiveFormsModule],
  providers: [
    { provide: LOGINABLE_TOKEN, useExisting: LoginService }
  ],
  templateUrl: './supplier-login.component.html',
  styleUrl: './supplier-login.component.scss'
})
export class SupplierLoginComponent {

  passwordType = signal<'text' | 'password'>('password')

  private nnfb = inject(NonNullableFormBuilder)
  private router = inject(Router)
  private toast = inject(ToastService)
  private loginService = inject(LOGINABLE_TOKEN)
  loginForm = this.nnfb.group({
    user: this.nnfb.control('', Validators.required),
    password: this.nnfb.control('', Validators.required)
  })

  disable = () => this.loginForm.invalid || !this.loginForm.touched

  togglePassword = () => this.passwordType.update(prev => prev === 'password' ? 'text' : 'password')

  handleLogin = () => {
    const formData = this.loginForm.getRawValue()
    this.loginService.login(formData).subscribe({
      next: () => {
        this.router.navigate([""])
      },
      error: (err) => {
        console.log(err);
        this.toast.danger('ล็อคอินผิดพลาด')
        this.loginForm.patchValue({ user: '', password: '' })
      }
    })
  }
}
