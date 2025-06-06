import { Component, computed, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-target-subform',
  imports: [FormsModule],
  template: `
  <div>
    @let targetValue = target();
    <div class="mb-3">
      <label class="form-label" for="target">target</label>
      <select
        class="form-select"
        name="target"
        id="target"
        [ngModel]="targetValue"
        (ngModelChange)="changeTarget($event)"
      >
        <option [ngValue]="0" disabled>กรุณาเลือก</option>
        <option [ngValue]="1">flat</option>
        <option [ngValue]="2">step(คิดจากบาทแรก)</option>
        <option [ngValue]="3">step(คิดแบบขั้นบันได)</option>
      </select>
    </div>
    <div class="p-3">
      @if (targetValue === 1) {
      <div class="bg-lightgray" style="padding: 0 8px">
        <div class="app-form-field-inline">
          <div style="margin: 16px 0">
            <label for="percent">ระบุ %</label>
          </div>
          <div style="margin: 16px 0">
            <input
              type="number"
              name="percent"
              id="percent"
              [ngModel]="percent()"
              (ngModelChange)="percentChange.emit($event)"
            />
          </div>
        </div>
      </div>
      }
      <!---->
      @if (needStep()) {
      <!---->
        @let stepList = step();
      <ul style="padding: 0; margin: 0">
        @for (s of stepList; track $index) {
        <li class="step-item">
          <div class="row">
            <div class="col">
              <div class="app-form-field-inline">
                <div>
                  <label [attr.for]="'start-input-' + $index">เริ่มต้น</label>
                </div>
                <div>
                  <input
                    [attr.name]="'start-input-' + $index"
                    [id]="'start-input-' + $index"
                    type="number"
                    [ngModel]="s.start"
                    (ngModelChange)="changeStart($index)($event)"
                  />
                </div>
              </div>
            </div>
            <div class="col">
              <div class="app-form-field-inline">
                <div>
                  <label [attr.for]="'percent-input-' + $index">ได้</label>
                </div>
                <div>
                  <input
                    [id]="'percent-input-' + $index"
                    type="number"
                    [ngModel]="s.percent"
                    (ngModelChange)="changePercent($index)($event)"
                  />
                </div>
                <div>%</div>
              </div>
            </div>

            <div class="col-auto">
              <button
                class="btn btn-danger"
                (click)="deleteStep($index)"
                [disabled]="stepList.length === 1"
              >
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </div>
        </li>
        }
      </ul>
      <div class="row justify-content-end">
        <div class="col-auto">
          <button class="btn btn-success" (click)="addStep()">
            <i class="bi bi-plus"></i>
          </button>
        </div>
      </div>
      }
    </div>
  </div>
  `,
  styles: `
  .step-item {
  list-style: none;
  background-color: #f5f5f5;
  padding: 0 8px;
  &:first-child {
    padding-top: 16px;
  }
}`
})
export class TargetSubformComponent {
  private defaultStep = { start: 0, percent: 0 }
  // 2wbd of target
  target = input(0)
  targetChange = output<number>()
  // 2wbd of percent in case of target === 1
  percent = input(0)
  percentChange = output<number>()
  invalidPercentTarget = computed(() => this.target() === 1 && this.percent() === 0)
  changeTarget(value: number) {
    const currentTarget = this.target()
    if (currentTarget === 1) {
      this.percentChange.emit(0)
      if (value === 2 || value === 3) {
        this.stepChange.emit([this.defaultStep])
      }
    }
    if (currentTarget === 2 || currentTarget === 3) {
      if (value !== 2 && value !== 3) {
        this.stepChange.emit([])
      }
    }
    this.targetChange.emit(value)
  }

  // 2wbd of step in case of target === 2 , 3 
  needStep = computed(() => { const currentTarget = this.target(); return currentTarget === 2 || currentTarget === 3; })
  step = input<TStepItem[]>([])
  stepChange = output<TStepItem[]>()
  private changeStepItem = <K extends keyof TStepItem>(k: K) => (idx: number) => (value: TStepItem[K]) => {
    const currentStep = this.step()
    const newStep = currentStep.map((p, i) => i === idx ? ({ ...p, [k]: Number(value) }) : p)
    this.stepChange.emit(newStep)
  }
  changeStart = this.changeStepItem('start')
  changePercent = this.changeStepItem('percent')
  deleteStep(idx: number) {
    const currentStep = this.step()
    const newStep = currentStep.filter((_, i) => i !== idx)
    this.stepChange.emit(newStep)
  }
  addStep() {
    const currentStep = this.step()
    const newStep = [...currentStep, this.defaultStep]
    this.stepChange.emit(newStep)
  }
}

type TStepItem = {
  start: number
  percent: number
}
