import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastService } from '../../../service/toast/toast.service';

@Component({
  selector: 'app-supplier-login',
  imports: [ReactiveFormsModule],
  templateUrl: './supplier-login.component.html',
  styleUrl: './supplier-login.component.scss'
})
export class SupplierLoginComponent {

  passwordType = signal<'text' | 'password'>('password')

  private nnfb = inject(NonNullableFormBuilder)
  private router = inject(Router)
  private toast = inject(ToastService)

  loginForm = this.nnfb.group({
    username: this.nnfb.control('', Validators.required),
    password: this.nnfb.control('', Validators.required)
  })

  disable = () => this.loginForm.invalid || !this.loginForm.touched

  togglePassword = () => this.passwordType.update(prev => prev === 'password' ? 'text' : 'password')

  handleLogin = () => {
    const formData = this.loginForm.getRawValue()
    // login(formData).subscribe({
    //   next: () => {
    // router.navigateByUrl("/")
    //  toast.success('สำเร็จ')
    //}
    //   error: (err) => {}
    // })
  }
}
