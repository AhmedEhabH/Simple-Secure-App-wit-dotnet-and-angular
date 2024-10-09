import {HttpErrorResponse} from '@angular/common/http';
import {Component, inject, OnInit} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatSnackBar} from '@angular/material/snack-bar';
import {ActivatedRoute, Router} from '@angular/router';

import {ResetPasswordRequest} from '../../interfaces/reset-password-request';
import {AuthService} from '../../services/auth.service';

@Component({
    selector : 'app-reset-password',
    standalone : true,
    imports : [ FormsModule ],
    templateUrl : './reset-password.component.html',
    styleUrl : './reset-password.component.css'
})
export class ResetPasswordComponent implements OnInit {
    authService: AuthService = inject(AuthService);
    router = inject(Router);
    route = inject(ActivatedRoute);
    matSnackBar = inject(MatSnackBar);

    resetPassword = {} as ResetPasswordRequest;

    ngOnInit(): void{this.route.queryParams.subscribe(params => {
        this.resetPassword.email = params['email'];
        this.resetPassword.token = params['token'];
    })}

    resetPasswordFn() {
        this.authService.resetPassword(this.resetPassword).subscribe({
            next : (res) => {
                if (res.isSuccess) {
                    this.matSnackBar.open(res.message, "Close",
                                          {duration : 5000});
                    this.router.navigate([ '/login' ]);
                } else {
                    this.matSnackBar.open(res.message, 'Dismiss',
                                          {duration : 5000});
                }
            },
            error : (err: HttpErrorResponse) => {
                console.error(err);
                this.matSnackBar.open(err.message, 'Close', {duration : 5000})
            }
        })
    }
}
