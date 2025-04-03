import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { TransferFormComponent } from "../transfer-form/transfer-form.component";
import { FormService } from '../../../../service/form/form.service';

@Component({
  selector: 'app-base-form',
  imports: [ReactiveFormsModule, TransferFormComponent],
  templateUrl: './base-form.component.html',
  styleUrl: './base-form.component.scss'
})
export class BaseFormComponent implements OnInit {

  ngOnInit(): void {
    this.cnForm.valueChanges.subscribe(console.log)
  }

  private formServ = inject(FormService)

  isTransfer = this.formServ.isTransfer
  cnForm = this.formServ.baseForm
  bankOpt = this.formServ.possibleBank
  reasonOpt = this.formServ.possibleReason
  resultOpt = this.formServ.possibleResult

}
