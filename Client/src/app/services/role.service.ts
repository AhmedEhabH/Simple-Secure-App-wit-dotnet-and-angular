import {Injectable} from '@angular/core';

import {environment} from '../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Role } from '../interfaces/role';

@Injectable({providedIn : 'root'})
export class RoleService {
    apiUrl: string = environment.apiUrl;
    constructor(private http:HttpClient) {}

    getRoles = ():Observable<Role[]> =>{
        return this.http.get<Role[]>(`${this.apiUrl}/roles`);
    }
}
