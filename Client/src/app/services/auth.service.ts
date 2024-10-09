import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {jwtDecode} from "jwt-decode";
import {map, Observable} from 'rxjs';

import {environment} from '../../environments/environment.development';
import {AuthResponse} from '../interfaces/auth-response';
import {ChangePasswordRequest} from '../interfaces/change-password-request';
import {LoginRequest} from '../interfaces/login-request';
import {RefreshTokenRequest} from '../interfaces/refresh-token-request';
import {RegisterRequest} from '../interfaces/register-request';
import {ResetPasswordRequest} from '../interfaces/reset-password-request';
import {UserDetail} from '../interfaces/user-detail';

@Injectable({providedIn : 'root'})
export class AuthService {
    apiUrl: string = environment.apiUrl;
    userKey: string = 'user';

    constructor(private http: HttpClient) {}

    login(data: LoginRequest): Observable<AuthResponse>{
        return this.http
            .post<AuthResponse>(`${this.apiUrl}/account/login`, data)
            .pipe(map((response: AuthResponse) => {
                if (response.isSuccess) {
                    localStorage.setItem(this.userKey,
                                         JSON.stringify(response));
                }
                return response;
            }))
    }

    logOut = (): void => { localStorage.removeItem(this.userKey); }

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
            // return !this.isTokenExpired();
            return true;
        }

    private isTokenExpired = ():
        boolean => {
            const token = this.getToken();
            if (!token)
                return true;

            const decoded = jwtDecode(token);

            const result = Date.now() >= decoded['exp']! * 1000;

            // if (result)
            //     this.logOut();

            // return result;
            return true;
        }

    getToken = (): string|null => {
        const user = localStorage.getItem(this.userKey);
        if (!user)
            return null;
        const userDetail: AuthResponse = JSON.parse(user);
        return userDetail.token;
    };

    getRefreshToken = (): string|null => {
        const user = localStorage.getItem(this.userKey);
        if (!user)
            return null;
        const userDetail: AuthResponse = JSON.parse(user);
        return userDetail.refreshToken;
    };

    refreshToken = (data: RefreshTokenRequest):
        Observable<AuthResponse> => {
            return this.http.post<AuthResponse>(
                `${this.apiUrl}/account/refresh-token}`, data);
        }

    register(data: RegisterRequest): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.apiUrl}/account/register`,
                                            data);
    }

    getAccountDetail = (): Observable<UserDetail >=> {
        return this.http.get<UserDetail>(`${this.apiUrl}/account/detail`);
    }

    getAllUsers = (): Observable<UserDetail[] >=> {
        return this.http.get<UserDetail[]>(`${this.apiUrl}/account`);
    }

    getUserRoles = ():
        string[]|null => {
            const token = this.getToken();
            if (!token)
                return null;

            const decodedToken: any = jwtDecode(token);
            return decodedToken.role || null;
        }

    forgetPassword = (email: string):
        Observable<AuthResponse> => {
            return this.http.post<AuthResponse>(
                `${this.apiUrl}/account/forget-password`, {email});
        }

    resetPassword = (data: ResetPasswordRequest):
        Observable<AuthResponse> => {
            return this.http.post<AuthResponse>(
                `${this.apiUrl}/account/reset-password`, data);
        }

    changePassword =
        (data: ChangePasswordRequest): Observable<AuthResponse> => {
            return this.http.post<AuthResponse>(
                `${this.apiUrl}/account/change-password`, data);
        }
}
