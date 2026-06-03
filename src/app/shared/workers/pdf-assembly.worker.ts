/// <reference lib="webworker" />

import { jsPDF } from 'jspdf';

export interface PdfPageData {
  dataUrl: string;
  width: number;
  height: number;
}

export interface PdfWorkerRequest {
  pages: PdfPageData[];
  filename: string;
}

export interface PdfWorkerResponse {
  blob: Blob;
  filename: string;
}

addEventListener('message', ({ data }: MessageEvent<PdfWorkerRequest>) => {
  const { pages, filename } = data;

  const pdf = new jsPDF({ format: 'a4', compress: true, orientation: 'portrait' });
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();

  const margin = { top: 1, bottom: 1, left: 1, right: 1 };
  const contentWidth = pdfWidth - margin.left - margin.right;
  const contentHeight = pdfHeight - margin.top - margin.bottom;

  pages.forEach((page, index) => {
    if (index > 0) pdf.addPage();

    const imgRatio = page.width / page.height;
    const contentRatio = contentWidth / contentHeight;

    let drawWidth: number;
    let drawHeight: number;

    if (imgRatio > contentRatio) {
      drawWidth = contentWidth;
      drawHeight = contentWidth / imgRatio;
    } else {
      drawHeight = contentHeight;
      drawWidth = contentHeight * imgRatio;
    }

    const x = margin.left + (contentWidth - drawWidth) / 2;
    const y = margin.top + (contentHeight - drawHeight) / 2;

    pdf.addImage(page.dataUrl, 'JPEG', x, y, drawWidth, drawHeight, undefined, 'FAST');
  });

  const blob = pdf.output('blob');
  postMessage({ blob, filename } satisfies PdfWorkerResponse);
});
