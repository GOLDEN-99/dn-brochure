import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { ApiService } from '../../../shared/services/api.service';
import { catchError, throwError } from 'rxjs';

@Injectable()
export class CnUploadImageService {
  private readonly url = `${environment.cnPath}/GenerateImg`
  private readonly api = inject(ApiService)

  uploadFileV2 = ({ wholeNumb, img }: TUploadRequest) =>
    this.api.post<{ link: string }>(this.url, {
      wholeNumb,
      passWord: "95e8e7908aaf8c86f470ec641afd1d42924c42c7df91b4cc447be363a35d842c",
      img: img.split(",")[1]
    })
      .pipe(
        catchError(err => throwError(() => err))
      )
}

type TUploadRequest = {
  wholeNumb: string
  img: string
}