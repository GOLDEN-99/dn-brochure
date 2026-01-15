import { computed, inject, Injectable, signal } from '@angular/core';
import { catchError, tap, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiService } from '../../api/api.service';



@Injectable({
  providedIn: 'root'
})
export class UploadImageService {

  constructor() { }

  private readonly url = `${environment.cnPath}/GenerateImg`
  private readonly api = inject(ApiService)

  image = signal<string[]>([])

  invalidImage = computed(() => this.image().length === 0)

  uploadFileV2 = ({ wholeNumb, img }: Omit<TUpload, 'passWord'>) => this.api.post<{ link: string }>(this.url, { wholeNumb, passWord: "95e8e7908aaf8c86f470ec641afd1d42924c42c7df91b4cc447be363a35d842c", img: img.split(",")[1] })
    .pipe(
      tap(({ link }) => this.image.update(prev => [...prev, link])),
      catchError(err => throwError(() => err))
    )


  noFile = computed(() => this.image().length === 0)


  clear = () => this.image.update(() => [])

  remove = (link: string) => {
    this.image.update(prev => prev.filter((l) => l !== link))
  }

}



type TUpload = { wholeNumb: string; img: string, passWord: string }
