import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from './services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const auth = inject(AuthService);

    return next(req).pipe(
        catchError((err: HttpErrorResponse) => {
            // evita loop infinito sull'endpoint di refresh stesso
            if (err.status === 401 && !req.url.includes('/auth/refresh') && !req.url.includes('/auth/login')) {
                return auth.refresh().pipe(
                    switchMap(() => next(req)),
                    catchError(() => {
                        return auth.logout().pipe(
                            switchMap(() => throwError(() => err))
                        )
                    })
                );
            }
            return throwError(() => err);
        })
    );
};
