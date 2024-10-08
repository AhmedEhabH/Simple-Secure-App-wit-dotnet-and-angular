import {HttpInterceptorFn} from '@angular/common/http';
import {inject} from '@angular/core';

import {AuthService} from '../services/auth.service';

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
    const authservice: AuthService = inject(AuthService);

    if (authservice.getToken()) {
        const cloned = req.clone({
            headers : req.headers.set('Authorization',
                                      `Bearer ${authservice.getToken()}`)
        });
        return next(cloned);
    }

    return next(req);
};
