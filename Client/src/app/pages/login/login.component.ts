import {Component, inject, OnInit} from '@angular/core';
import {
    FormBuilder,
    FormGroup,
    ReactiveFormsModule,
    Validators
} from '@angular/forms';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {Router, RouterLink} from '@angular/router';

import {AuthService} from '../../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
    selector : 'app-login',
    standalone : true,
    imports :
        [ MatInputModule, MatIconModule, ReactiveFormsModule, RouterLink ],
    templateUrl : './login.component.html',
    styleUrl : './login.component.css'
})
export class LoginComponent implements OnInit {

    hide: boolean = true;

    form!: FormGroup;
    fb = inject(FormBuilder);
    ngOnInit(): void {
        this.form = this.fb.group({
            email : [ '', [ Validators.required, Validators.email ] ],
            password : [ '', [ Validators.required ] ]
        });
    }

    // constructor(private service:AuthService){}
    authService: AuthService = inject(AuthService);
    matSnackBar: MatSnackBar = inject(MatSnackBar);
    router = inject(Router);

    login(): void {
        this.authService.login(this.form.value).subscribe({
            next : (response) => { 
                this.matSnackBar.open(response.message, 'Close', {
                    duration: 5000,
                    horizontalPosition: 'center',
                });
                this.router.navigate(['/']);
             },
            error : (error) => { 
                console.error(error);
                this.matSnackBar.open(error.error.message, 'Close', {
                    duration: 5000,
                    horizontalPosition: 'center',
                });
                this.router.navigate(['/']);
             }
        });
    }
}
