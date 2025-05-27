// src/app/services/auth.service.ts

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private baseUrl = 'http://localhost:8989/'; 

  constructor(private http: HttpClient) {}

  register(data: any) {
    return this.http.post(`${this.baseUrl}api/auth`, data);
  }

  login(data: any) {
    return this.http.post(`${this.baseUrl}api/auth/login`, data);
  }
getCurrentUsername() {
  const token = localStorage.getItem('token');
  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`
  });
  return this.http.get<{ userName: string }>('http://localhost:8989/api/Profile/current-username', { headers })
    .pipe(
      map(response => response.userName)
    );
}
changeUsername(data: { newUserName: string }) {
  const token = localStorage.getItem('token');

  const headers = new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  });

  return this.http.put('http://localhost:8989/api/Profile/update-username', data, {
    headers: headers,
    observe: 'response',
    responseType: 'text' as 'json'
  });
}


changePassword(data: { oldPassword: string, newPassword: string, confirmPassword: string }) {
    const token = localStorage.getItem('token'); 

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this.http.put('http://localhost:8989/api/Profile/update-password', data, {
      headers: headers,
      observe: 'response',
      responseType: 'text' as 'json'
    });
  }
  saveToken(token: string) {
    localStorage.setItem('token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  logout() {
    localStorage.removeItem('token');
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }
  getRoleFromToken(): string | null {
  const token = this.getToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || null;
  } catch (e) {
    console.error('Invalid token format', e);
    return null;
  }
}

}
