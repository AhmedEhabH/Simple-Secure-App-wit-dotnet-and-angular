import {inject} from '@angular/core';
import {MatSnackBar} from '@angular/material/snack-bar';
import {CanActivateFn, Router} from '@angular/router';

import {AuthService} from '../services/auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
    const authService: AuthService = inject(AuthService);
    const router: Router = inject(Router);
    const matSnackBar = inject(MatSnackBar);

    const roles = route.data['roles'] as string[];

    if (!authService.isLoggedIn()) {
        router.navigate([ '/login' ]);
        matSnackBar.open('Please login first', 'Close', {duration : 5000});
        return false;
    }

    const userRoles = authService.getUserRoles();

    if (roles.some(role => userRoles?.includes(role)))
        return true;

    router.navigate([ '/' ]);
    matSnackBar.open('You do not have the permission to view this page',
                     'Close', {duration : 5000});
    return false;
};
