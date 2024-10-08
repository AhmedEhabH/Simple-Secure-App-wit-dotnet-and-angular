import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {jwtDecode} from "jwt-decode";
import {map, Observable} from 'rxjs';

import {environment} from '../../environments/environment.development';
import {AuthResponse} from '../interfaces/auth-response';
import {LoginRequest} from '../interfaces/login-request';
import {RegisterRequest} from '../interfaces/register-request';
import { UserDetail } from '../interfaces/user-detail';

@Injectable({providedIn : 'root'})
export class AuthService {
    apiUrl: string = environment.apiUrl;
    tokenKey: string = 'token';

    constructor(private http: HttpClient) {}

    login(data: LoginRequest): Observable<AuthResponse>{
        return this.http
            .post<AuthResponse>(`${this.apiUrl}/account/login`, data)
            .pipe(map((response: AuthResponse) => {
                if (response.isSuccess) {
                    localStorage.setItem(this.tokenKey, response.token);
                }
                return response;
            }))
    }

    logOut = (): void => { localStorage.removeItem(this.tokenKey); }

    getUserDetail =
        () => {
            const token = this.getToken();
            if (!token)
                return null;

            const decodedToken: any = jwtDecode(token);
            const userDetail = {
                id : decodedToken.nameid,
                fullName : decodedToken.name,
                email : decodedToken.email,
                roles : decodedToken.role || [],
            }

            return userDetail;
        }

    isLoggedIn = ():
        boolean => {
            const token = this.getToken();
            if (!token)
                return false;
            return !this.isTokenExpired();
        }

    private isTokenExpired = ():
        boolean => {
            const token = this.getToken();
            if (!token)
                return true;

            const decoded = jwtDecode(token);

            const result = Date.now() >= decoded['exp']! * 1000;

            if (result)
                this.logOut();

            return result;
        }

    getToken = (): string
        |null => localStorage.getItem(this.tokenKey) || '';

    register(data: RegisterRequest): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.apiUrl}/account/register`,
                                            data);
    }

    getAccountDetail = () : Observable<UserDetail>=>{
        return this.http.get<UserDetail>(`${this.apiUrl}/account/detail`);
    }
}
