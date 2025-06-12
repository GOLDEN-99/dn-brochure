import { Component, computed, inject, input, OnDestroy, OnInit, output } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbTimepicker, NgbTimeStruct } from '@ng-bootstrap/ng-bootstrap';
import { distinctUntilChanged, distinctUntilKeyChanged, filter, Subject, takeUntil, tap } from 'rxjs';
import { TDuration } from '../../../service/ibob/baseDoorForm';

@Component({
  selector: 'app-timeslot-row',
  imports: [ReactiveFormsModule, NgbTimepicker],
  templateUrl: './timeslot-row.component.html',
  styleUrl: './timeslot-row.component.scss'
})
export class TimeslotRowComponent implements OnInit, OnDestroy {

  ngOnInit(): void {
    this.range$.pipe(takeUntil(this.sub$))
      .subscribe((value) => this.timeRangeForm.patchValue(value))

    this.timeRangeForm.valueChanges
      .pipe(
        filter(this.predicateNull),
        takeUntil(this.sub$)
      ).subscribe(this.onChange)
  }
  private predicateNull = (value: TNullableTimeRange): value is TDuration => !!value.form && !!value.to
  private isEqual = (prev: TDuration, curr: TDuration) =>
    prev.form.hour === curr.form.hour &&
    prev.form.minute === curr.form.minute &&
    prev.form.second === curr.form.second &&
    prev.to.hour === curr.to.hour &&
    prev.to.minute === curr.to.minute &&
    prev.to.second === curr.to.second

  private nnfb = inject(NonNullableFormBuilder)
  range = input.required<TDuration>()
  rangeChange = output<TDuration>()
  delete = output<void>()
  add = output<void>()
  range$ = toObservable(this.range).pipe(distinctUntilChanged(this.isEqual))
  sub$ = new Subject<void>()
  onChange = (value: TDuration) => this.rangeChange.emit(value)

  timeRangeForm = this.nnfb.group({
    form: this.nnfb.control<NgbTimeStruct>({ hour: 0, minute: 0, second: 0 }),
    to: this.nnfb.control<NgbTimeStruct>({ hour: 0, minute: 0, second: 0 })
  })

  withDel = input(true)

  onDelete = () => this.delete.emit()

  ngOnDestroy(): void {
    this.sub$.next()
    this.sub$.complete()
  }


}

type TNullableTimeRange = { form?: NgbTimeStruct | null, to?: NgbTimeStruct | null }
