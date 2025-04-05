import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ApiService } from '../api/api.service';
import { catchError, EMPTY, from, mergeMap, Subject, tap, toArray } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UploadImageService {

  constructor() { }

  private url = `${environment.cnPath}/GenerateImage`
  private api = inject(ApiService)

  image = signal<string[]>([])

  body = signal<File[]>([])

  uploadCall = (req: TUpload) => this.api.post<string>(this.url, req)
    .pipe(
      tap((res) => this.image.update(prev => [...prev, res])),
      catchError(err => EMPTY)
    )

  upload = ({ wholeNumb, passWord }: Omit<TUpload, 'img'>) => from(this.body())
    .pipe(
      mergeMap((f) => this.uploadCall({ wholeNumb, passWord, img: f }), 1),
      toArray()
    )

}

type TUpload = { wholeNumb: string; img: string | File, passWord: string }
