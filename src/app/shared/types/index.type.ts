import { HttpContext, HttpHeaders, HttpParams } from "@angular/common/http";
import type * as XLSXType from 'xlsx'
import html2pdf from 'jspdf-html2canvas'
import html2canvas from 'html2canvas';

export type TApiOpt = {
  headers?: HttpHeaders | Record<string, string | string[]>;
  context?: HttpContext;
  observe?: 'body';
  params?: HttpParams | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
  reportProgress?: boolean;
  withCredentials?: boolean;
  transferCache?: {
    includeHeaders?: string[];
  } | boolean;
}

export type TOptionable = string | number | Record<string, unknown>

export type TMaybe<T> = T | null

export interface IXLSXFunctionality {
  writeFile(data: XLSXType.WorkBook, filename: string, opts?: XLSXType.WritingOptions): void;
  utils: XLSXType.XLSX$Utils
}

export interface IPDFJsFunctionality {
  toPDF: typeof html2pdf;
  toImg: typeof html2canvas;
}
