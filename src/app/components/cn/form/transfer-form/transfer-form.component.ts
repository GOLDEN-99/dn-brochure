import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ControlContainer, FormGroup, FormGroupDirective, NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { TMapForm } from '../../../../types';
import { TBank } from '../../../../types/cn.type';
import { CNF_TOKEN } from '../../../../lib';

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
    console.log(this.parent)
    return this.parent.form as any
  }
  private nnfb = inject(NonNullableFormBuilder)

  constructor() {

  }
  ngOnInit(): void {
    this.parentCtrl.registerControl('transferData', this.nnfb.group<TMapForm<TBank>>({
      accountName: this.nnfb.control(''),
      accountNumber: this.nnfb.control(''),
      bank: this.nnfb.control("")
    }))
  }
  ngOnDestroy(): void {
    this.parentCtrl.removeControl('transferData')
  }
}
