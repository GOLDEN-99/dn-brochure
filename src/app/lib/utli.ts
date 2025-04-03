import { catchError, pipe, throwError } from "rxjs";

export const catchErrorAndRethrow = () => catchError((err) => throwError(() => err))