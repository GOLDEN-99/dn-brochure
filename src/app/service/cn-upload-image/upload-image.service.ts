import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ApiService } from '../api/api.service';
import { catchError, EMPTY, from, mergeMap, Subject, tap, toArray } from 'rxjs';
import { TMaybe } from '../../types';

@Injectable({
  providedIn: 'root'
})
export class UploadImageService {

  constructor() { }

  private url = `${environment.cnPath}/GenerateImage`
  private api = inject(ApiService)

  body = signal<TBody[]>([])

  uploadCall = (req: TUpload, index: number) => this.api.post<string>(this.url, req)
    .pipe(
      tap((res) => this.body.update((prev) => prev.map(
        (body, idx) => idx === index
          ? ({ img: body.img, path: res })
          : body
      ))),
      catchError(err => EMPTY)
    )

  upload = ({ wholeNumb, passWord }: Omit<TUpload, 'img'>) => {
    const reqList = this.body()
    return from(reqList)
      .pipe(
        mergeMap(({ img }, idx) => this.uploadCall({ wholeNumb, passWord, img }, idx), 1),
        toArray()
      )
  }

}

type TBody = {
  img: string | File
  path: TMaybe<string>
}

type TUpload = { wholeNumb: string; img: string | File, passWord: string }
