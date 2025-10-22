import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from '../../../service/toast/toast.service';
import { LOGINABLE_TOKEN } from '../../../service/ibob/ibobToken';
import { IbobAddService } from '../../../service/ibob/ibob-add.service';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-supplier-login',
  imports: [ReactiveFormsModule],
  providers: [
    { provide: LOGINABLE_TOKEN, useExisting: IbobAddService }
  ],
  templateUrl: './supplier-login.component.html',
  styleUrl: './supplier-login.component.scss'
})
export class SupplierLoginComponent {

  passwordType = signal<'text' | 'password'>('password')

  private nnfb = inject(NonNullableFormBuilder)
  private router = inject(Router)
  private route = inject(ActivatedRoute)
  private toast = inject(ToastService)
  private loginService = inject(LOGINABLE_TOKEN)
  private compType$ = this.route.parent?.paramMap.pipe(map(p => p.get('compType')?.toUpperCase() ?? '')) ?? new BehaviorSubject('')
  private compType = toSignal(this.compType$, { initialValue: '' })
  loginForm = this.nnfb.group({
    user: this.nnfb.control('', Validators.required),
    password: this.nnfb.control('', Validators.required)
  })

  disable = () => this.loginForm.invalid || !this.loginForm.touched

  togglePassword = () => this.passwordType.update(prev => prev === 'password' ? 'text' : 'password')

  handleLogin = () => {
    const redirect = this.route.snapshot.queryParamMap.getAll('redirect')
    const formData = this.loginForm.getRawValue()
    const expectedCompType = this.compType()
    this.loginService.login(formData).subscribe({
      next: (res) => {
        if (res.comp.shipto !== expectedCompType) {
          this.toast.danger(`username หรือ password ไม่ถูกต้องสำหรับ ${expectedCompType}`)
          return
        }
        this.loginService.saveLogin({ compType: expectedCompType, user: formData.user }, res)
        this.loginService.setAppState(res);
        this.router.navigate([...redirect], { queryParams: { compCode: formData.user }, relativeTo: this.route })
      },
      error: (err) => {
        this.toast.danger('ล็อคอินผิดพลาด')
        this.loginForm.patchValue({ user: '', password: '' })
      }
    })
  }
}
