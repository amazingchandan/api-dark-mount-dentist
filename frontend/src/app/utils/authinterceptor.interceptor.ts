import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse, HttpClient } from '@angular/common/http';
import { catchError, Observable, switchMap, throwError } from 'rxjs';
import { AppService } from '../services/app.service';
import { UserService } from '../services/user.service';
import { environment } from 'src/environments/environment';

@Injectable()
export class AuthinterceptorInterceptor implements HttpInterceptor {

  constructor(
    private appService: AppService,
    private apiService: UserService
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if(request.url.indexOf(environment.PAYPAL_API) > -1)
    {
      return next.handle(request);
    }
    let modifiedRequist = request;
    if (this.appService.getToken()) {
      modifiedRequist = request.clone({
        setHeaders: {
          Authorization: `Bearer ${this.appService.getToken()}`
        }
      });
    }
    console.log(modifiedRequist)
    return next.handle(modifiedRequist).pipe(catchError((err: HttpErrorResponse) => {
      if (err.status === 401) {
        return this.refreshAccessToken(request, next);
      }
      return throwError(() => ({"message": err.error.message, "status": err.status}));
    }));
  }

  refreshAccessToken(request: HttpRequest<any>, next: HttpHandler) {
    const refreshToken = localStorage.getItem("refreshtoken") || '';
    return this.apiService.onLogin(refreshToken).pipe(switchMap((res: any) => {
        console.log(res.body.userInfo.token)
      // if (res.status === 1 && res.error_code === 0) {
        // this.appService.setToken('token', res.body.userInfo.token);
        return next.handle(this.AddTokenheader(request, res.body.userInfo.token));
      // }
      // else {
      //   this.appService.logout();
      // }
    }),
    catchError((err: HttpErrorResponse) => {
      console.log(err);
      this.appService.logout();
      return throwError(() => ({"message": err.error.message, "status": err.status}));
    })
    );
  }

  AddTokenheader(request: HttpRequest<any>, token: any) {
    return request.clone({ headers: request.headers.set('Authorization', 'bearer ' + token) });
  }
}
