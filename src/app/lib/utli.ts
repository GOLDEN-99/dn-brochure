import { catchError, debounceTime, distinctUntilChanged, Observable, of, pipe, throwError } from "rxjs";
import * as XLSX from "xlsx"

export const catchErrorAndRethrow = <T>() => catchError<T, Observable<never>>((err) => throwError(() => err))

export const deepEqual = <T>(prev: T, current: T): boolean => {
    const tOfPrev = typeof prev
    const tOfCur = typeof current
    if (prev == null || current == null) return prev === current;
    if (Array.isArray(prev) && Array.isArray(current)) {
        if (prev.length !== current.length) return false;
        return prev.every((p, i) => deepEqual(p, current[i]))
    }
    if (tOfPrev === 'object' && tOfCur === 'object') {
        const prevKeys = Object.keys(prev) as Array<keyof T>;
        const currentKeys = Object.keys(current) as Array<keyof T>;
        if (prevKeys.length !== currentKeys.length) return false
        return prevKeys.every((pk) => deepEqual(prev[pk], current[pk]) && pk in currentKeys)
    }
    return prev === current;

};

export const toXlxs = async (filename: string, sheetName: string, data: any[]) => {
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.aoa_to_sheet(data)
    XLSX.utils.book_append_sheet(wb, ws, sheetName)
    await XLSX.writeFileXLSX(wb, filename)
}

export const toManyXlxs = async (filename: string, sheetList: string[], data: any[]) => {
    const wb = XLSX.utils.book_new()
    for (let i = 0; i < sheetList.length; i++) {
        const ws = XLSX.utils.aoa_to_sheet(data[i])
        XLSX.utils.book_append_sheet(wb, ws, sheetList[i])
    }
    await XLSX.writeFileXLSX(wb, filename)
}

export const getOrElse = <In, Out = In>(fallback: Out) => catchError<In, Observable<Out>>((err) => {
    console.log(err);
    return of(fallback)
})


export const debounceSearch = <T>(time: number) => pipe<Observable<T>, Observable<T>, Observable<T>>(distinctUntilChanged<T>(), debounceTime(time)) 