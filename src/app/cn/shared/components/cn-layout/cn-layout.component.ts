import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { CnStateService } from '../../services/cn-state.service';
import { distinctUntilChanged, map, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { CNRouteParamSchema } from '../../libs/parse-cn-param';
import { CnApiService } from '../../services/cn-api.service';
import { CnLoadError } from '../../types/cn.type';

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
  private readonly route = inject(ActivatedRoute)
  private readonly router = inject(Router)
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
      error: (err: unknown) => {
        this.loading.set(false)
        if (err instanceof CnLoadError) {
          this.state.loadError.set(err)
        } else {
          const message = err instanceof Error ? err.message : JSON.stringify(err)
          this.state.loadError.set(new CnLoadError('unknown', message, { saleCode: '', wholeCode: '', wholeNumb: '', isWRR: '' }))
        }
        this.router.navigate(['fail'], { relativeTo: this.route })
      }
    })
  }
  ngOnDestroy(): void {
    this.sub$.next()
    this.sub$.complete();
  }
}
