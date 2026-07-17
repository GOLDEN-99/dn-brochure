import { inject, Injectable } from '@angular/core';
import { forkJoin, from, map, Observable, of, switchMap } from 'rxjs';
import { LibLoaderService } from './lib-loader.service';

export class ExportError extends Error {
  constructor(public readonly reason: unknown) {
    super('Export failed');
  }
}

@Injectable()
export class ExportPdfService {
  private readonly libLoader = inject(LibLoaderService)
  private readonly pdfLib$ = this.libLoader.loadPDF()

  private blobToDataUrl(img: HTMLImageElement, blob: Blob): Observable<void> {
    return new Observable<void>(observer => {
      const reader = new FileReader();
      reader.onloadend = () => {
        img.src = reader.result as string;
        observer.next();
        observer.complete();
      };
      reader.onerror = () => observer.error(reader.error);
      reader.readAsDataURL(blob);
    });
  }

  private loadImages(ele: HTMLElement): Observable<HTMLElement> {
    const images = Array.from(ele.querySelectorAll("img")).filter(img => img.src.startsWith('http'));

    if (!images.length) return of(ele);

    const imageObservables = images.map(img =>
      from(fetch(img.src)).pipe(
        switchMap(response => response.blob()),
        switchMap(blob => this.blobToDataUrl(img, blob)),
      )
    );

    return forkJoin(imageObservables).pipe(map(() => ele));
  }

  private renderCanvas(ele: HTMLElement): Observable<HTMLCanvasElement> {
    return this.pdfLib$.pipe(
      switchMap(lib => from(lib.toImg(ele, { useCORS: true, scale: 1, logging: true })))
    );
  }

  private toDownloadLink(canvas: HTMLCanvasElement, filename: string): HTMLAnchorElement {
    const link = document.createElement('a');
    link.download = `${filename}-${Date.now()}.jpg`;
    link.href = canvas.toDataURL('image/jpeg', 1);
    return link;
  }

  private triggerDownload(link: HTMLAnchorElement): void {
    link.click();
  }

  exportImg(ele: HTMLElement, filename: string): Observable<void> {
    return this.loadImages(ele).pipe(
      switchMap(content => this.renderCanvas(content)),
      map(canvas => this.toDownloadLink(canvas, filename)),
      map(link => this.triggerDownload(link))
    );
  }

  private renderPdf(elements: HTMLElement[], filename: string): Observable<void> {
    return this.pdfLib$.pipe(
      switchMap(lib => from(lib.toPDF(elements, {
        jsPDF: { format: 'a4', compress: true, orientation: 'portrait' },
        margin: { right: 1, left: 1, top: 1, bottom: 1 },
        autoResize: true,
        output: `${filename}-${Date.now()}.pdf`
      }))),
      map(() => undefined)
    );
  }

  exportPdf(elements: HTMLElement[], filename: string): Observable<void> {
    return forkJoin(elements.map(ele => this.loadImages(ele))).pipe(
      switchMap(content => this.renderPdf(content, filename))
    );
  }
}
