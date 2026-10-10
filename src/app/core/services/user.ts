import { Injectable, inject } from '@angular/core';

import {
  HttpClient,
  HttpHeaders
} from '@angular/common/http';

import { Observable } from 'rxjs';


export interface User {

  id: number;

  name: string;

  email: string;

  role: string;

}


@Injectable({
  providedIn: 'root'
})
export class UserService {

  private http =
    inject(HttpClient);


  private apiUrl =
    'http://localhost:8080/api/users';


  private getHeaders(): HttpHeaders {

    const token =
      localStorage.getItem('token');

    return new HttpHeaders({

      Authorization:
        `Bearer ${token}`

    });
  }


  getProfile(): Observable<User> {

    return this.http.get<User>(

      `${this.apiUrl}/profile`,

      {
        headers:
          this.getHeaders()
      }

    );
  }


  updateProfile(
    user: User
  ): Observable<User> {

    return this.http.put<User>(

      `${this.apiUrl}/profile`,

      user,

      {
        headers:
          this.getHeaders()
      }

    );
  }

}
