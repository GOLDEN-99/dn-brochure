import { inject, Signal, signal } from "@angular/core"
import { TCompProduct, TDNComp, TDNCompRes, THUComp, THUCompRes } from "../../types/ibob-supplier.type"
import { catchError, distinctUntilChanged, map, Observable, shareReplay, Subject, switchMap, tap, throwError } from "rxjs"
import { takeUntilDestroyed } from "@angular/core/rxjs-interop"
import { ApiService } from "../api/api.service"
import { environment } from "../../../environments/environment"
import { ISupplierList } from "./supplier.token"

export abstract class SupplierCompBase<T extends TCompCat> implements ISupplierList {
    constructor() {
        this.baseComp$.subscribe()
        this.product$.subscribe()
    }
    protected api = inject(ApiService)
    protected url = environment.ibob

    abstract fetchFn(compCode: string): Observable<TCompRes<T>>
    abstract selector(comp: TCompRes<T>): TDetailComp<T>
    abstract pageLabel: Signal<"DN" | "HU">

    searchCompCode(compCode: string) {
        this.compCode$.next(compCode)
    }
    product = signal<TCompProduct[]>([])
    compBase = signal<TDetailComp<T> | null>(null)
    private compCode$ = new Subject<string>()
    private res$ = this.compCode$
        .pipe(
            distinctUntilChanged(),
            switchMap(this.fetchFn),
            catchError(err => throwError(() => err)),
            shareReplay(1)
        )

    private baseComp$ = this.res$
        .pipe(
            map(this.selector),
            tap(data => this.compBase.set(data)),
            takeUntilDestroyed()
        )
    private product$ = this.res$
        .pipe(
            map(({ item }) => item),
            tap(data => this.product.set(data)),
            takeUntilDestroyed()
        )
}

type TCompCat = 'HU' | 'DN'

type TCompRes<T extends TCompCat> = T extends 'HU' ? THUCompRes : TDNCompRes

type TDetailComp<T extends TCompCat> = T extends 'HU' ? THUComp : TDNComp