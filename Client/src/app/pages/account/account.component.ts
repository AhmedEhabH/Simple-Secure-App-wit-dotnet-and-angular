import {Component, inject} from '@angular/core';

import {AuthService} from '../../services/auth.service';
import { AsyncPipe, CommonModule, TitleCasePipe, UpperCasePipe } from '@angular/common';

@Component({
    selector : 'app-account',
    standalone : true,
    imports : [CommonModule, AsyncPipe, UpperCasePipe, TitleCasePipe],
    templateUrl : './account.component.html',
    styleUrl : './account.component.css'
})
export class AccountComponent {
    authservice: AuthService = inject(AuthService);

    accountDetail$ = this.authservice.getAccountDetail();


}
