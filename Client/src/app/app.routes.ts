import {Routes} from '@angular/router';

import {authGuard} from './guards/auth.guard';
import {roleGuard} from './guards/role.guard';
import {AccountComponent} from './pages/account/account.component';
import {
    ForgetPasswordComponent
} from './pages/forget-password/forget-password.component';
import {HomeComponent} from './pages/home/home.component';
import {LoginComponent} from './pages/login/login.component';
import {RegisterComponent} from './pages/register/register.component';
import {
    ResetPasswordComponent
} from './pages/reset-password/reset-password.component';
import {RoleComponent} from './pages/role/role.component';
import {UsersComponent} from './pages/users/users.component';

export const routes: Routes = [
    {path : '', component : HomeComponent},
    {path : 'login', component : LoginComponent},
    {path : 'register', component : RegisterComponent},
    {
        path : 'account/:id',
        component : AccountComponent,
        canActivate : [ authGuard ]
    },
    {
        path : 'users',
        component : UsersComponent,
        canActivate : [ roleGuard ],
        data : {roles : [ 'Admin' ]}
    },
    {
        path : 'roles',
        component : RoleComponent,
        canActivate : [ roleGuard ],
        data : {roles : [ 'Admin' ]}
    },
    {path : 'forget-password', component : ForgetPasswordComponent},
    {path : 'reset-password', component : ResetPasswordComponent},

];
