import { computed, inject, Injectable, signal } from '@angular/core';
import { catchError, EMPTY, from, mergeMap, tap, throwError, toArray } from 'rxjs';
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

  // body = signal<TBody[]>([])

  image = signal<string[]>([])

  invalidImage = computed(() => this.image().length === 0)

  uploadFileV2 = ({ wholeNumb, img }: Omit<TUpload, 'passWord'>) => this.api.post<{ link: string }>(this.url, { wholeNumb, passWord: "95e8e7908aaf8c86f470ec641afd1d42924c42c7df91b4cc447be363a35d842c", img: img.split(",")[1] })
    .pipe(
      tap(({ link }) => this.image.update(prev => [...prev, link])),
      catchError(err => throwError(() => err))
    )

  // uploadSingle = ({ wholeNumb, img }: Omit<TUpload, 'passWord'>, index: number) => this.api.post<{ link: string }>(this.url, { wholeNumb, passWord: "95e8e7908aaf8c86f470ec641afd1d42924c42c7df91b4cc447be363a35d842c", img: img.split(",")[1] })
  //   .pipe(
  //     tap(({ link }) => this.body.update((prev) => prev.map(
  //       (body, idx) => idx === index
  //         ? ({ ...body, path: link })
  //         : body
  //     ))),
  //     catchError(err => throwError(() => err))
  //   )

  // upload = ({ wholeNumb }: Pick<TUpload, 'wholeNumb'>) => {
  //   const reqList = this.body()
  //   return from(reqList)
  //     .pipe(
  //       mergeMap(({ img, path }, idx) =>
  //         path === null
  //           ? this.uploadSingle({ wholeNumb, img }, idx)
  //           : EMPTY
  //         , 1),
  //       toArray()
  //     )
  // }

  noFile = computed(() => this.image().length === 0)

  // appendFile = (img: string) => this.body.update(prev => [...prev, { img, path: null }])

  clear = () => this.image.update(() => [])

  remove = (link: string) => {
    this.image.update(prev => prev.filter((l) => l !== link))
  }

}

type TBody = {
  img: string
  path: TMaybe<string>
}

type TUpload = { wholeNumb: string; img: string, passWord: string }
