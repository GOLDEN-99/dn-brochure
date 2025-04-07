import { inject, Signal } from "@angular/core";
import { CnOrderService } from "../../service/cn/cn-order/cn-order.service";
import { CnApiService } from "../../service/cn/cn-api/cn-api.service";
import { UploadImageService } from "../../service/cn/cn-upload-image/upload-image.service";
import { CnRemarkService } from "../../service/cn/cn-remark/cn-remark.service";
import { ToastService } from "../../service/toast/toast.service";
import { TGoodItemReq } from "../../types/cn.type";

export abstract class BaseSubmitCn implements ISubmitMethodCn, ISubmitCnProps {
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
            this.toast.success('สำเร็จ')
        },
        error: () => {
            this.toast.danger('เกิดข้อผิดพลาด')
        }
    }
    handleSubmit() {
        const head = this.head()
        const goodList = this.goodList()
        const totalprice = this.totalprice()
        const motive = this.motive()
        const image = this.image()
        this.submit({ ...head, goodList, image, totalprice, ...motive })
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