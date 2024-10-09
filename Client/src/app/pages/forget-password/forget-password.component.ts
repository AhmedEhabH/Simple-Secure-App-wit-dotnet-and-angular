import {HttpErrorResponse} from '@angular/common/http';
import {Component, inject} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatSnackBar} from '@angular/material/snack-bar';

import {AuthService} from '../../services/auth.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector : 'app-forget-password',
    standalone : true,
    imports : [ FormsModule, MatIconModule ],
    templateUrl : './forget-password.component.html',
    styleUrl : './forget-password.component.css'
})
export class ForgetPasswordComponent {
    authService: AuthService = inject(AuthService);
    matSnackBar: MatSnackBar = inject(MatSnackBar);

    email!: string;
    showEmailSent: boolean = false;
    isSubmitting: boolean = false;

    forgetOassword() {
        this.isSubmitting = true;
        this.authService.forgetPassword(this.email).subscribe({
            next : (res) => {
                console.log(res);
                if (res.isSuccess) {
                    this.matSnackBar.open(res.message, "Close",
                                          {duration : 5000});
                    this.showEmailSent = true;
                } else {
                    this.matSnackBar.open(res.message, 'Dismiss',
                                          {duration : 5000});
                }
            },
            error : (err: HttpErrorResponse) => {
                this.matSnackBar.open(err.message, 'Close', {duration : 5000})
            },
            complete : () => {
                this.isSubmitting = false;
            }
        });
    }
}
