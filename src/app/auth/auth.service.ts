import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
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
  private API_KEY = 'AIzaSyC8A3iBM_CahOLbkwoL2K1rNppsgEe-H1Q';
  private signUpBaseUrl =
    'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=';
  private signInBaseUrl =
    'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=';
  user = new Subject<User>();

  constructor(private http: HttpClient) {}

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

  private handleAuthentication(email: string, userId: string, token: string, expiresIn: number): void {
    // The unit of getTime() return value is millisecond while the unit of expiresIn is seconds
    const expirationData = new Date (new Date(new Date().getTime() + expiresIn * 1000));
    const user = new User(email, userId, token, expirationData);
    this.user.next(user);
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
