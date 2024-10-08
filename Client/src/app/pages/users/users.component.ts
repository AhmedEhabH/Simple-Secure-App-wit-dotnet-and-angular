import {Component, inject} from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { AsyncPipe, CommonModule } from '@angular/common';

@Component({
    selector : 'app-users',
    standalone : true,
    imports : [CommonModule, AsyncPipe],
    templateUrl : './users.component.html',
    styleUrl : './users.component.css'
})
export class UsersComponent {
    authService: AuthService = inject(AuthService);

    users$ = this.authService.getAllUsers();

    
}
