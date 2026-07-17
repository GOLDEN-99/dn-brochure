import { catchError, Observable, of, pipe, throwError } from "rxjs";

export const catchAndRethrow = () => pipe(catchError(err => throwError(() => err)))

export const getOrElse = <Out, In>(defaultValue: Out) => pipe(catchError<In, Observable<Out>>(_ => of<Out>(defaultValue)))