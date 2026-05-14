import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, retry, switchMap, throwError, timer } from 'rxjs';
import { AuthService } from './services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const auth = inject(AuthService);

    return next(req).pipe(
        retry({
            count: 1,
            delay: (err) => err instanceof HttpErrorResponse && err.status === 0
                ? timer(300)
                : throwError(() => err)
        }),
        catchError((err: HttpErrorResponse) => {
            if (err.status === 401 &&
                !req.url.includes('/auth/refresh') &&
                !req.url.includes('/auth/login') &&
                !req.url.includes('/auth/logout') &&
                !req.url.includes('/auth/me')
            ) {
                return auth.refresh().pipe(
                    catchError((refreshErr) => {
                        if (refreshErr instanceof HttpErrorResponse && refreshErr.status === 401) {
                            return auth.logout("session expired").pipe(switchMap(() => throwError(() => err)));
                        }
                        return throwError(() => err);
                    }),
                    switchMap(() => next(req)),
                );
            }
            return throwError(() => err);
        })
    );
};
