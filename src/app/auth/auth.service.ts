import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

interface AuthResponseData {
  idToken: string;
  email: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private API_KEY = 'AIzaSyC8A3iBM_CahOLbkwoL2K1rNppsgEe-H1Q';
  private signUpBaseUrl = 'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=';
  private signInBaseUrl = 'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=';

  constructor(private http: HttpClient) { }

  signUp(em: string, ps: string): Observable<AuthResponseData> {
    return this.http.post<AuthResponseData>(this.signUpBaseUrl + this.API_KEY, {
      email: em,
      password: ps,
      returnSecureToken: true
    }).pipe(catchError(errorRes => {
      let errorMessage = 'An unknown error occurred!';
      if (!errorRes.error || !errorRes.error.error) {
        return throwError(errorMessage);
      }
      switch (errorRes.error.error.message) {
        case 'EMAIL_EXISTS':
          errorMessage = 'This email address exists already!';
      }
      return throwError(errorMessage);
    }));
  }

}
