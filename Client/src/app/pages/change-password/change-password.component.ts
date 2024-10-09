import {HttpErrorResponse} from '@angular/common/http';
import {Component, inject} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Router} from '@angular/router';

import {AuthService} from '../../services/auth.service';

@Component({
    selector : 'app-change-password',
    standalone : true,
    imports : [ [ FormsModule ] ],
    templateUrl : './change-password.component.html',
    styleUrl : './change-password.component.css'
})
export class ChangePasswordComponent {
    authService: AuthService = inject(AuthService);
    matSnackBar: MatSnackBar = inject(MatSnackBar);
    router: Router = inject(Router);

    currentPassword!: string;
    newPassword!: string;

    changePassword() {
        this.authService
            .changePassword({
                email : this.authService.getUserDetail()?.email,
                currentPassword : this.currentPassword,
                newPassword : this.newPassword
            })
            .subscribe({
                next : (res) => {
                    if (res.isSuccess) {
                        this.matSnackBar.open(res.message, 'Close',
                                              {duration : 3000});
                        this.authService.logOut();
                        this.router.navigate([ '/login' ]);
                    } else {
                        this.matSnackBar.open(res.message, 'Dismiss',
                                              {duration : 3000});
                    }
                },
                error : (err: HttpErrorResponse) => {
                    this.matSnackBar.open(err.error.message, 'Close',
                                          {duration : 3000});
                }
            });
    }
}
