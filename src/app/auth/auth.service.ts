import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { UserDto } from './user-dto';
import { User } from './user.model';

export interface AuthResponseData {
  kind: string;
  idToken: string;
  email: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
  registered?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private API_KEY = environment.firebaseAPIKey;
  private signUpBaseUrl =
    'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=';
  private signInBaseUrl =
    'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=';
  user = new BehaviorSubject<User>(null);
  private tokenExpirationTimer: any;

  constructor(private http: HttpClient, private router: Router) {}

  signUp(em: string, ps: string): Observable<AuthResponseData> {
    return this.http
      .post<AuthResponseData>(this.signUpBaseUrl + this.API_KEY, {
        email: em,
        password: ps,
        returnSecureToken: true,
      })
      .pipe(catchError(this.handleError), tap(resData => {
        this.handleAuthentication(resData.email, resData.localId, resData.idToken, +resData.expiresIn);
      }));
  }

  login(em: string, ps: string): Observable<AuthResponseData> {
    return this.http.post<AuthResponseData>(this.signInBaseUrl + this.API_KEY, {
      email: em,
      password: ps,
      returnSecureToken: true,
    })
    .pipe(catchError(this.handleError), tap(resData => {
      this.handleAuthentication(resData.email, resData.localId, resData.idToken, +resData.expiresIn);
    }));
  }

  autoLogin(): void {
    const userData = JSON.parse(localStorage.getItem('userData')) as UserDto;
    if (userData) {
      const user = new User(userData.email, userData.id, userData._token, new Date(userData._tokenExpirationDate));
      if (user.token) {
        this.user.next(user);
        const expirationDuration = new Date(userData._tokenExpirationDate).getTime() - new Date().getTime();
        this.autoLogout(expirationDuration);
      }
    }
  }

  logout(): void {
    this.user.next(null); // set the current user to null
    this.router.navigate(['/auth']);
    localStorage.removeItem('userData');

    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
      this.tokenExpirationTimer = null;
    }
  }

  autoLogout(expirationDuration: number): void {
    this.tokenExpirationTimer = setTimeout(() => {
      this.logout();
    }, expirationDuration);
  }

  private handleAuthentication(email: string, userId: string, token: string, expiresIn: number): void {
    // The unit of getTime() return value is millisecond while the unit of expiresIn is seconds
    const expirationData = new Date (new Date().getTime() + expiresIn * 1000);
    const user = new User(email, userId, token, expirationData);
    this.user.next(user);
    localStorage.setItem('userData', JSON.stringify(user));
    this.autoLogout(expiresIn * 1000);
  }

  private handleError(errorRes: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred!';
    if (!errorRes.error || !errorRes.error.error) {
      return throwError(errorMessage);
    }
    switch (errorRes.error.error.message) {
      case 'EMAIL_EXISTS':
        errorMessage = 'This email address exists already!';
        break;
      case 'EMAIL_NOT_FOUND':
        errorMessage = 'This email address does not exist!';
        break;
      case 'INVALID_PASSWORD':
        errorMessage = 'This password is not correct.';
        break;
    }
    return throwError(errorMessage);
  }
}
