import {HttpErrorResponse, HttpInterceptorFn} from '@angular/common/http';
import {inject} from '@angular/core';
import {Router} from '@angular/router';
import {catchError, throwError} from 'rxjs';

import {AuthService} from '../services/auth.service';

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
    const authservice: AuthService = inject(AuthService);
    const router: Router = inject(Router);

    if (authservice.getToken()) {
        return next(req);
    }
    const cloned = req.clone({
        headers :
            req.headers.set('Authorization', `Bearer ${authservice.getToken()}`)
    });

    return next(cloned).pipe(catchError((err: HttpErrorResponse) => {
        if (err.status === 401) {
            // handle unauthorized request
            authservice
                .refreshToken({
                    email : authservice.getUserDetail()?.email,
                    token : authservice.getToken() || "",
                    refreshToken : authservice.getRefreshToken() || "",
                })
                .subscribe({
                    next : (res) => {
                        if (res.isSuccess) {
                            localStorage.setItem('user', JSON.stringify(res));
                            const cloned = req.clone({
                                setHeaders :
                                    {Authorization : `Bearer ${res.token}`}
                            });
                            location.reload();
                        }
                    },
                    error : (err: HttpErrorResponse) => {
                        authservice.logOut();
                        router.navigate([ '/login' ]);
                    }
                });
        }
        return throwError(err);
    }));
};
