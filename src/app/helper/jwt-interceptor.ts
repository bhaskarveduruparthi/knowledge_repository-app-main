import { HttpRequest, HttpHandlerFn, HttpEvent, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthenticationService } from '@/pages/service/authentication.service';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
export const jwtInterceptor: HttpInterceptorFn = (request: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
 const authenticationService = inject(AuthenticationService);
 const token = authenticationService.tokenValue;
 const isLoggedIn = !!token?.access_token;
 const apiUrlBase = `${environment.protocol}://${environment.apiBaseHost}/`;
 const agentUrlBase = `${environment.protocol}://${environment.agentApiBaseHost}/`;
 const isApiUrl = request.url.startsWith(apiUrlBase) || request.url.startsWith(agentUrlBase);
 if (isLoggedIn && isApiUrl) {
   request = request.clone({
     setHeaders: {
       Authorization: `Bearer ${token.access_token}`
     }
   });
 }
 return next(request);
};