import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormService } from '../../../../service/form/form.service';
import { FormGroupDirective, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-result-dropdown',
  imports: [ReactiveFormsModule],
  templateUrl: './result-dropdown.component.html',
  styleUrl: './result-dropdown.component.scss',
  viewProviders: [
    {
      provide: FormGroupDirective,
      useFactory: () => inject(FormGroupDirective, { skipSelf: true })
    }
  ]
})
export class ResultDropdownComponent implements OnInit, OnDestroy {
  private formServ = inject(FormService)
  private fb = this.formServ.fb
  private parent = inject(FormGroupDirective)
  get parentCtrl() {
    return this.parent.form
  }
  resultOpt = this.formServ.possibleResult

  ngOnInit(): void {
    this.parentCtrl.registerControl("result", this.fb.nonNullable.control(""))
  }

  ngOnDestroy(): void {

  }
}
