import { HttpInterceptorFn } from '@angular/common/http';

export const credentialsInterceptor: HttpInterceptorFn = (request, next) => {
  let clone = request.clone({ withCredentials: true });
  
  // Extract XSRF-TOKEN from cookies
  const match = document.cookie.match(/(^|;)\s*XSRF-TOKEN\s*=\s*([^;]+)/);
  const xsrfToken = match ? decodeURIComponent(match[2]) : null;
  
  if (xsrfToken) {
    clone = clone.clone({
      headers: clone.headers.set('X-XSRF-TOKEN', xsrfToken)
    });
  }
  
  return next(clone);
};
