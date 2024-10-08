import {CommonModule} from '@angular/common';
import {Component, EventEmitter, Input, Output} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';

import {Role} from '../../interfaces/role';

@Component({
    selector : 'app-role-list',
    standalone : true,
    imports : [ CommonModule, MatIconModule ],
    templateUrl : './role-list.component.html',
    styleUrl : './role-list.component.css'
})
export class RoleListComponent {
    @Input({required : true}) roles!: Role[]|null;
    @Output() deleteRole:EventEmitter<string> = new EventEmitter<string>();

    deleteRoleFn(id: string): void {
        this.deleteRole.emit(id);
    }
}
