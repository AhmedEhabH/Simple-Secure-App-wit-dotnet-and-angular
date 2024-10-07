import {Component} from '@angular/core';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {RouterLink} from '@angular/router';

@Component({
    selector : 'app-register',
    standalone : true,
    imports : [
        RouterLink, MatFormFieldModule, MatInputModule, MatIconModule,
        MatSelectModule
    ],
    templateUrl : './register.component.html',
    styleUrl : './register.component.css'
})
export class RegisterComponent {
}
