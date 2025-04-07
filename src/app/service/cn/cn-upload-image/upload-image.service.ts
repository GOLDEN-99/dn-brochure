import { computed, inject, Injectable, signal } from '@angular/core';
import { catchError, EMPTY, from, mergeMap, tap, throwError, toArray } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiService } from '../../api/api.service';
import { TMaybe } from '../../../types';
import { TPrependImage } from '../../../types/cn.type';


@Injectable({
  providedIn: 'root'
})
export class UploadImageService {

  constructor() { }

  private url = `${environment.cnPath}/GenerateImg`
  private api = inject(ApiService)

  body = signal<TBody[]>([])

  image = computed(() => this.body().flatMap(({ path }) => path !== null ? [path] : []))

  uploadSingle = ({ wholeNumb, passWord, img }: TUpload, index: number) => this.api.post<{ link: string }>(this.url, { wholeNumb, passWord, img: img.split(",")[1] })
    .pipe(
      tap(({ link }) => this.body.update((prev) => prev.map(
        (body, idx) => idx === index
          ? ({ ...body, path: link })
          : body
      ))),
      catchError(err => throwError(() => err))
    )

  upload = ({ wholeNumb, passWord }: Omit<TUpload, 'img'>) => {
    const reqList = this.body()
    return from(reqList)
      .pipe(
        mergeMap(({ img, path }, idx) =>
          path === null
            ? this.uploadSingle({ wholeNumb, passWord, img }, idx)
            : EMPTY
          , 1),
        toArray()
      )
  }

  noFile = computed(() => this.body().length === 0)

  appendFile = (img: string) => this.body.update(prev => [...prev, { img, path: null }])

  clear = () => this.body.update(() => [])

  remove = (idx: number) => {
    this.body.update(prev => prev.filter((_, i) => i !== idx))
  }

}

type TBody = {
  img: string
  path: TMaybe<string>
}

type TUpload = { wholeNumb: string; img: string, passWord: string }
