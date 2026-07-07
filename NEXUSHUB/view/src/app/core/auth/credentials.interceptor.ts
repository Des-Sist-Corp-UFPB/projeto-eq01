import { HttpInterceptorFn } from '@angular/common/http';

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
  return match ? decodeURIComponent(match[3]) : null;
}

export const credentialsInterceptor: HttpInterceptorFn = (request, next) => {
  let req = request.clone({ withCredentials: true });

  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
    const xsrfToken = getCookie('XSRF-TOKEN');
    if (xsrfToken) {
      req = req.clone({
        headers: req.headers.set('X-XSRF-TOKEN', xsrfToken)
      });
    }
  }

  return next(req);
};
