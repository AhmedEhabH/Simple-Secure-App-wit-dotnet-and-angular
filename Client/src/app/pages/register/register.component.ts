import {AsyncPipe, CommonModule} from '@angular/common';
import {HttpErrorResponse} from '@angular/common/http';
import {Component, inject, OnInit} from '@angular/core';
import {
    AbstractControl,
    FormBuilder,
    FormGroup,
    ReactiveFormsModule,
    Validators
} from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Router, RouterLink} from '@angular/router';
import {Observable} from 'rxjs';

import {Role} from '../../interfaces/role';
import {ValidationError} from '../../interfaces/validation-error';
import {AuthService} from '../../services/auth.service';
import {RoleService} from '../../services/role.service';

@Component({
    selector : 'app-register',
    standalone : true,
    imports : [
        CommonModule, RouterLink, ReactiveFormsModule, MatFormFieldModule,
        MatInputModule, MatIconModule, MatSelectModule, AsyncPipe
    ],
    templateUrl : './register.component.html',
    styleUrl : './register.component.css'
})
export class RegisterComponent implements OnInit {
    matSnackBar: MatSnackBar = inject(MatSnackBar)
    fb: FormBuilder = inject(FormBuilder);
    router: Router = inject(Router);
    roleService: RoleService = inject(RoleService);
    authService: AuthService = inject(AuthService);

    roles$!: Observable<Role[]>;

    registerForm!: FormGroup;
    passwordHide: boolean = true;
    confirmPasswordHide: boolean = true;
    errors!: ValidationError[];

    ngOnInit(): void {
        this.registerForm = this.fb.group({
            email : [ '', [ Validators.required, Validators.email ] ],
            password : [
                '',
                [
                    Validators.required, Validators.minLength(8),
                    Validators.pattern(
                        /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/)
                ]
            ],
            confirmPassword : [ '', [ Validators.required ] ],
            fullName : [ '', [ Validators.required, Validators.minLength(2) ] ],
            roles : [ '', [] ]
        },
                                          {
                                              validator :
                                                  this.passwordMatchValidator
                                          });

        this.roles$ = this.roleService.getRoles();
    }

    register(): void {
        // console.log(this.registerForm.value);

        if (this.registerForm.invalid) {
            return;
        }
        this.authService.register(this.registerForm.value).subscribe({
            next : (res) => {
                // console.log(res);
                this.matSnackBar.open(`${res}`, 'Close', {
                    duration : 5000,
                    horizontalPosition : 'center',
                });
                this.registerForm.reset();
                this.router.navigate([ '/login' ]);
            },
            error : (err: HttpErrorResponse) => {
                // console.error(err);
                if (err!.status == 400) {
                    this.errors = err!.error;
                    // console.log(this.errors);
                    
                    this.matSnackBar.open('Validation error', 'Close', {
                        duration : 5000,
                        horizontalPosition : 'center',
                    });
                }
            },
            complete :
                () => { console.log('Registration completed successfuly'); }
        });
    }

    private passwordMatchValidator =
        (control: AbstractControl): {[key: string]: boolean}|null => {
            const password = control.get('password')?.value;
            const confirmPassword = control.get('confirmPassword')?.value;

            if (password && confirmPassword && password !== confirmPassword) {
                return {passwordMismatch : true};
            }
            return null;
        }
}
