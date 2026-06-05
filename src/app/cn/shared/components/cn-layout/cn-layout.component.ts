import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { CnStateService } from '../../services/cn-state.service';
import { distinctUntilChanged, map, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { CNRouteParamSchema } from '../../libs/parse-cn-param';
import { CnApiService } from '../../services/cn-api.service';
import { ToastService } from '../../../../service/toast/toast.service';

@Component({
  selector: 'app-cn-layout',
  imports: [RouterOutlet],
  templateUrl: './cn-layout.component.html',
  styles: `
    .form-wrapper {
      margin: auto;
      padding: 1rem;
      width: 100%;
      @media (min-width: 992px) {
        width: 920px;
      }
    }
  `,
})
export class CnLayoutComponent implements OnInit, OnDestroy {
  private readonly cnClient = inject(CnApiService)
  private readonly state = inject(CnStateService)
  private readonly toast = inject(ToastService)
  private readonly route = inject(ActivatedRoute)
  private readonly sub$ = new Subject<void>()

  loading = signal(true)

  ngOnInit(): void {
    this.route.params.pipe(
      map((param) => CNRouteParamSchema.parse(param)),
      distinctUntilChanged((a, b) =>
        a.isWRR === b.isWRR
        && a.saleCode === b.saleCode
        && a.wholeCode === b.wholeCode
        && a.wholeNumb === b.wholeNumb
      ),
      tap(() => this.loading.set(true)),
      switchMap(params => this.cnClient.getData(params)),
      takeUntil(this.sub$)
    ).subscribe({
      next: (result) => {
        this.loading.set(false)
        this.state.formState.update(({ stepOne }) => ({
          metadata: {
            saleCode: result.saleCode,
            isWRR: result.isWRR,
            bankAcName: result.bankAcName,
            bankCode: result.bankCode,
            bankNumb: result.bankNumb,
            code: result.code,
            name: result.name,
            wholeCode: result.wholeCode,
            wholeDate: result.wholeDate,
            wholeName: result.wholeName,
            wholeNumb: result.wholeNumb,
          },
          stepOne: {
            ...stepOne, cnCount: result.goodList.reduce((acc, cur) => acc + cur.useItem, 0)
          },
          image: [],
          returnList: result.goodList.map(good => ({ good, amount: 0, check: false })),
        }))
      },
      error: (err: Error) => {
        this.loading.set(false)
        this.toast.danger('ไม่สามารถโหลดข้อมูลได้')
        this.toast.danger(err.message)
      }
    })
  }
  ngOnDestroy(): void {
    this.sub$.next()
    this.sub$.complete();
  }
}
