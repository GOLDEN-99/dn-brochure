import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroupDirective, ReactiveFormsModule } from '@angular/forms';
import { TCnType } from '../../../../types/cn.type';

@Component({
  selector: 'app-cn-type-form',
  imports: [ReactiveFormsModule],
  templateUrl: './cn-type-form.component.html',
  styleUrl: './cn-type-form.component.scss',
  viewProviders: [{
    provide: FormGroupDirective,
    useFactory: () => inject(FormGroupDirective, { skipSelf: true })
  }]
})
export class CnTypeFormComponent implements OnInit, OnDestroy {
  parent = inject(FormGroupDirective)
  get parentCtrl() {
    return this.parent.form as any
  }
  private fb = inject(FormBuilder)

  constructor() {

  }
  ngOnInit(): void {
    this.parentCtrl.registerControl('cnType', this.fb.control<TCnType>("some"))
  }
  ngOnDestroy(): void {
    this.parentCtrl.removeControl('transferData')
  }
}

