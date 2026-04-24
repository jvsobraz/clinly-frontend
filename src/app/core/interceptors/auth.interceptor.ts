import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { BehaviorSubject, catchError, filter, switchMap, take, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { AuthResponse } from '../models/auth.model';

// Shared state so concurrent 401s don't each trigger a separate refresh
let refreshing = false;
const refreshSubject = new BehaviorSubject<AuthResponse | null>(null);

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const auth = inject(AuthService);
  const token = auth.token();

  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}`, 'X-Requested-With': 'XMLHttpRequest' } })
    : req.clone({ setHeaders: { 'X-Requested-With': 'XMLHttpRequest' } });

  return next(authReq).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status !== 401 || req.url.includes('/auth/')) {
        return throwError(() => err);
      }

      if (!refreshing) {
        refreshing = true;
        refreshSubject.next(null);

        return auth.refreshToken().pipe(
          switchMap(res => {
            refreshing = false;
            refreshSubject.next(res);
            const retryReq = req.clone({
              setHeaders: {
                Authorization: `Bearer ${res.token}`,
                'X-Requested-With': 'XMLHttpRequest',
              },
            });
            return next(retryReq);
          }),
          catchError(refreshErr => {
            refreshing = false;
            refreshSubject.next(null);
            auth.logout();
            return throwError(() => refreshErr);
          }),
        );
      }

      // Another request is already refreshing — wait for it to complete
      return refreshSubject.pipe(
        filter(res => res !== null),
        take(1),
        switchMap(res => {
          const retryReq = req.clone({
            setHeaders: {
              Authorization: `Bearer ${res!.token}`,
              'X-Requested-With': 'XMLHttpRequest',
            },
          });
          return next(retryReq);
        }),
      );
    }),
  );
};
