import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormGroupDirective, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TMapForm } from '../../../../types';
import { TBank } from '../../../../types/cn.type';

@Component({
  selector: 'app-transfer-form',
  imports: [ReactiveFormsModule],
  templateUrl: './transfer-form.component.html',
  styleUrl: './transfer-form.component.scss',
  viewProviders: [{
    provide: FormGroupDirective,
    useFactory: () => inject(FormGroupDirective, { skipSelf: true })
  }]
})
export class TransferFormComponent implements OnInit, OnDestroy {
  parent = inject(FormGroupDirective)
  get parentCtrl() {
    return this.parent.form as any
  }
  private nnfb = inject(NonNullableFormBuilder)

  constructor() {

  }
  ngOnInit(): void {
    this.parentCtrl.registerControl('transferData', this.nnfb.group<TMapForm<TBank>>({
      accountName: this.nnfb.control('', Validators.required),
      accountNumber: this.nnfb.control('', Validators.required),
      bank: this.nnfb.control("", Validators.required)
    }))
  }
  ngOnDestroy(): void {
    this.parentCtrl.removeControl('transferData')
  }
}
