import { HttpErrorResponse, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { catchError, tap, throwError } from 'rxjs';
import { challengeEndpoint } from './challenges.service';

export const requestLogInterceptor: HttpInterceptorFn = (request, next) => {
  if (request.url !== challengeEndpoint && !request.url.startsWith(challengeEndpoint + '/')) {
    return next(request);
  }
  console.info('[Apex Trial]', request.method, request.urlWithParams);
  return next(request).pipe(
    tap(event => {
      if (event instanceof HttpResponse) {
        console.info('[Apex Trial]', event.status, request.urlWithParams);
      }
    }),
    catchError((error: HttpErrorResponse) => {
      console.warn('[Apex Trial]', error.status, request.urlWithParams, error.message);
      const message = error.status === 404
        ? 'Челендж не знайдено.'
        : (error.error?.message ?? 'Не вдалося виконати запит. Спробуй ще раз.');
      return throwError(() => new Error(message));
    }),
  );
};
