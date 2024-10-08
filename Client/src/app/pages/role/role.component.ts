import {AsyncPipe} from '@angular/common';
import {HttpErrorResponse} from '@angular/common/http';
import {Component, inject} from '@angular/core';
import {MatSnackBar} from '@angular/material/snack-bar';

import {
    RoleFormComponent
} from "../../components/role-form/role-form.component";
import {
    RoleListComponent
} from "../../components/role-list/role-list.component";
import {RoleCreateRequest} from '../../interfaces/role-create-request';
import {RoleService} from '../../services/role.service';
import { RoleAssignComponent } from '../../components/role-assign/role-assign.component';

@Component({
    selector : 'app-role',
    standalone : true,
    imports : [ RoleFormComponent, RoleListComponent, AsyncPipe, RoleAssignComponent ],
    templateUrl : './role.component.html',
    styleUrl : './role.component.css'
})
export class RoleComponent {
    roleService: RoleService = inject(RoleService);
    matSnackBar = inject(MatSnackBar)

    errorMessage: string = '';
    role: RoleCreateRequest = {} as RoleCreateRequest;

    roles$ = this.roleService.getRoles();

    createRole(role: RoleCreateRequest) {
        this.roleService.createRole(role).subscribe({
            next : (res: {message: string}) => {
                // console.log(res);
                this.matSnackBar.open("Role created successfully", 'Ok', {
                    duration : 3000,
                    horizontalPosition : 'center',
                });
                this.roles$ = this.roleService.getRoles();
            },
            error : (err: HttpErrorResponse) => {
                console.error(err);

                if (err.status === 400) {
                    this.errorMessage = err.error;
                }
                this.matSnackBar.open(this.errorMessage, 'Ok', {
                    duration : 3000,
                    horizontalPosition : 'center',
                })
            }
        });
    }
    deleteRole(id: string) {
        this.roleService.deleteRole(id).subscribe({
            next : (res) => {
                this.roles$ = this.roleService.getRoles();
                // console.log('Role deleted successfully');
                this.matSnackBar.open('Role deleted successfully', 'Close', {
                    duration : 3000,
                    horizontalPosition : 'center',
                });
                this.errorMessage = '';
            },
            error : (err: HttpErrorResponse) => {
                console.error(err);
                this.errorMessage = err.error;
                this.matSnackBar.open(err.message, 'Close', {
                    duration : 3000,
                    horizontalPosition : 'center',
                });
            }
        });
    }

    assignRole(data:any) {
        this.roleService.assignRole(data.userId, data.roleId).subscribe({
            next : (res) => {
                this.roles$ = this.roleService.getRoles();
                this.matSnackBar.open('Role assigned successfully', 'Close', {
                    duration : 3000,
                    horizontalPosition : 'center',
                });
            },
            error : (err: HttpErrorResponse) => {
                console.error(err);
                this.errorMessage = err.error;
                this.matSnackBar.open(err.message, 'Close', {
                    duration : 3000,
                    horizontalPosition : 'center',
                });
            }
        })
    }
}
