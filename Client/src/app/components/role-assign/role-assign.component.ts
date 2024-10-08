import {AsyncPipe, CommonModule} from '@angular/common';
import {Component, EventEmitter, inject, Input, Output} from '@angular/core';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';

import {Role} from '../../interfaces/role';
import {AuthService} from '../../services/auth.service';

@Component({
    selector : 'app-role-assign',
    standalone : true,
    imports : [
        CommonModule, MatFormFieldModule, MatInputModule, AsyncPipe,
        MatSelectModule
    ],
    templateUrl : './role-assign.component.html',
    styleUrl : './role-assign.component.css'
})
export class RoleAssignComponent {
    @Input({required : true}) roles!: Role[]|null;
    @Output()
    assignRole: EventEmitter<{userId : string | null, roleId: string|null}> =
        new EventEmitter<{userId : string | null, roleId: string|null}>();

    authService: AuthService = inject(AuthService);

    users$ = this.authService.getAllUsers();
    selectedUser: string|null = '';
    selectedRole: string|null = '';

    assignRoleFn(): void {
        this.assignRole.emit(
            {userId : this.selectedUser, roleId : this.selectedRole});
    }
}
