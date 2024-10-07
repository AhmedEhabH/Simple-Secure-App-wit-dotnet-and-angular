import {CommonModule} from '@angular/common';
import {Component, inject} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatMenuModule} from '@angular/material/menu';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MatToolbarModule} from '@angular/material/toolbar';
import {Router, RouterLink} from '@angular/router';

import {AuthService} from '../../services/auth.service';

@Component({
    selector : 'app-navbar',
    standalone : true,
    imports : [
        CommonModule, MatToolbarModule, MatButtonModule, MatIconModule,
        RouterLink, MatMenuModule
    ],
    templateUrl : './navbar.component.html',
    styleUrl : './navbar.component.css'
})
export class NavbarComponent {
    authService: AuthService = inject(AuthService);
    router: Router = inject(Router);
    matSnackBar: MatSnackBar = inject(MatSnackBar);

    isLoggedIn() { return this.authService.isLoggedIn(); }

    logout() {
        this.authService.logOut();
        this.matSnackBar.open('Logged out successfully', 'Close',
                              {duration : 5000, horizontalPosition : 'center'});
        this.router.navigate([ '/login' ]);
    }
}
