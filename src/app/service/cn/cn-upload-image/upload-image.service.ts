import { computed, inject, Injectable, signal } from '@angular/core';
import { catchError, from, mergeMap, tap, throwError, toArray } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiService } from '../../api/api.service';
import { TMaybe } from '../../../types';


@Injectable({
  providedIn: 'root'
})
export class UploadImageService {

  constructor() { }

  private url = `${environment.cnPath}/GenerateImg`
  private api = inject(ApiService)

  body = signal<TBody[]>([])

  image = computed(() => this.body().flatMap(({ path }) => path !== null ? [path] : []))

  uploadSingle = (req: TUpload, index: number) => this.api.post<string>(this.url, req)
    .pipe(
      tap((res) => this.body.update((prev) => prev.map(
        (body, idx) => idx === index
          ? ({ img: body.img, path: res })
          : body
      ))),
      catchError(err => throwError(() => err))
    )

  upload = ({ wholeNumb, passWord }: Omit<TUpload, 'img'>) => {
    const reqList = this.body()
    return from(reqList)
      .pipe(
        mergeMap(({ img }, idx) => this.uploadSingle({ wholeNumb, passWord, img }, idx), 1),
        toArray()
      )
  }

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
