import { catchError, Observable, of, OperatorFunction, pipe, throwError } from "rxjs";

export const catchAndRethrow = () => pipe(catchError(err => throwError(() => err)))

export const getOrElse  = <In, Out>(defaultValue: Out) => pipe(catchError<In, Observable<Out>>(_ => of(defaultValue)))