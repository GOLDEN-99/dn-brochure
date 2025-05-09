import { Component, inject, OnInit, signal } from '@angular/core';
import { FormArray, FormGroup, FormsModule, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TMapForm } from '../../../../types';
import { NgbTimepicker, NgbTimeStruct } from '@ng-bootstrap/ng-bootstrap';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-add-schedule-form',
  imports: [FormsModule, ReactiveFormsModule, NgbTimepicker, RouterLink],
  templateUrl: './add-schedule-form.component.html',
  styleUrl: './add-schedule-form.component.scss'
})
export class AddScheduleFormComponent implements OnInit {

  ngOnInit(): void {
    this.headForm.controls.duration.valueChanges.subscribe((d) => this.durationStep.update(() => d))
  }

  durationStep = signal<number>(0)
  private nnfb = inject(NonNullableFormBuilder)

  headForm = this.nnfb.group({
    name: this.nnfb.control("", [Validators.required]),
    duration: this.nnfb.control(0, [Validators.required, Validators.min(1)]),
    remark: this.nnfb.control(""),
    admin: this.nnfb.control("", [Validators.required]),
    adminEmail: this.nnfb.control("", [Validators.required, Validators.email]),
    isMultiple: this.nnfb.control(false)
  })


  form: TMainForm = this.nnfb.group({
    sun: this.nnfb.array<TDurationSubForm>([]),
    mon: this.nnfb.array<TDurationSubForm>([]),
    tue: this.nnfb.array<TDurationSubForm>([]),
    wed: this.nnfb.array<TDurationSubForm>([]),
    thu: this.nnfb.array<TDurationSubForm>([]),
    fri: this.nnfb.array<TDurationSubForm>([]),
    sat: this.nnfb.array<TDurationSubForm>([]),
  })

  disable = signal(false)

  keys = Object.keys(this.form.controls) as TFormKey[]


  addForm = (ctrlName: TFormKey) => this.form.controls[ctrlName]
    .push(this.nnfb.group({
      form: this.nnfb.control<NgbTimeStruct>({ hour: 8, minute: 0, second: 0 }, [Validators.required]),
      to: this.nnfb.control<NgbTimeStruct>({ hour: 8, minute: 0, second: 0 }, [Validators.required]),
    }))

  removeForm = (key: TFormKey, j: number) => this.form.controls[key].removeAt(j)

  getThaiDay = (k: TFormKey) => {
    switch (k) {
      case 'sun': return 'วันอาทิตย์'
      case 'mon': return 'วันจันทร์'
      case 'tue': return 'วันอังคาร'
      case 'wed': return 'วันพุธ'
      case 'thu': return 'วันพฤหัส'
      case 'fri': return 'วันศุกร์'
      case 'sat': return 'วันเสาร์'
    }
  }
}

type TDuration = {
  form: NgbTimeStruct,
  to: NgbTimeStruct
}

type TDurationSubForm = FormGroup<TMapForm<TDuration>>

type TFormKey = 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat'

type TMainForm = FormGroup<{
  [key in TFormKey]: FormArray<TDurationSubForm>
}>
