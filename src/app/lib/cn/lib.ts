import { inject, input, OnInit, signal, Signal } from "@angular/core";
import { CnOrderService } from "../../service/cn/cn-order/cn-order.service";
import { CnApiService } from "../../service/cn/cn-api/cn-api.service";
import { UploadImageService } from "../../service/cn/cn-upload-image/upload-image.service";
import { CnRemarkService } from "../../service/cn/cn-remark/cn-remark.service";
import { ToastService } from "../../service/toast/toast.service";
import { TGoodItemReq } from "../../types/cn.type";
import { ActivatedRoute, Router } from "@angular/router";
import { distinctUntilChanged, filter, map, Subject } from "rxjs";

export abstract class BaseSubmitCn implements ISubmitMethodCn, ISubmitCnProps {
    private route = inject(ActivatedRoute)
    private sub$ = new Subject<void>()
    protected getUrl() {
        this.route.parent?.paramMap
            .pipe(
                map(r => r.get('isWRR'))
                , filter(r => typeof r === 'string')
                , map(r => r === '0' ? '' : r)
                , distinctUntilChanged()
            )
            .subscribe({
                next: (wrr) => {
                    this.isWRR.set(wrr)
                }
            })
    }
    protected unsub() {
        this.sub$.next();
        this.sub$.complete();
    }
    private router = inject(Router)
    protected isWRR = signal("")
    protected cnApiServ = inject(CnApiService)
    protected orderServ = inject(CnOrderService)
    protected imageServ = inject(UploadImageService)
    protected remarkServ = inject(CnRemarkService)
    protected toast = inject(ToastService)
    protected head = this.cnApiServ.prependReq
    protected motive = this.remarkServ.prependReq
    protected image = this.imageServ.image
    private submit = this.cnApiServ.submit
    private handler = {
        next: () => {
            const p = this.cnApiServ.paramsSignal()
            const isWRR = this.isWRR()
            if (!p) return
            const { saleCode, wholeCode, wholeNumb } = p
            this.toast.success('สำเร็จ')
            this.router.navigate(['cn', saleCode, wholeCode, wholeNumb, isWRR || '0', 'complete'])
        },
        error: () => {
            this.toast.danger('เกิดข้อผิดพลาด')
        }
    }
    handleSubmit() {
        const head = this.head()
        const goodList = this.goodList()
        const nonNullableLotGoodList = goodList.map(({ lotNumber, ...res }) => ({ ...res, lotNumber: lotNumber ?? '' }))
        const totalprice = this.totalprice()
        const motive = this.motive()
        const image = this.image()
        const isWRR = this.isWRR()
        this.submit({ ...head, goodList: nonNullableLotGoodList, image, totalprice, ...motive, isWRR })
            .subscribe(this.handler)
    }
    abstract disable: Signal<boolean>;
    abstract goodList: Signal<TGoodItemReq[]>;
    abstract totalprice: Signal<number>;
}

export interface ISubmitMethodCn {
    handleSubmit(): void
}

export interface ISubmitCnProps {
    disable: Signal<boolean>
    goodList: Signal<TGoodItemReq[]>
    totalprice: Signal<number>
}