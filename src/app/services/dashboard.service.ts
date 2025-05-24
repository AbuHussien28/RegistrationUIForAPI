import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from './auth.service'; // ضروري للوصول للتوكن
import { catchError, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private baseUrl = 'http://localhost:8989/api/dashboard';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getAuthHeaders() {
    const token = this.authService.getToken();
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`
      })
    };
  }

  getTotalRegistrations() {
    return this.http.get<number>(`${this.baseUrl}/total-registrations`, this.getAuthHeaders());
  }

  getTotalEvents() {
    return this.http.get<number>(`${this.baseUrl}/total-events`, this.getAuthHeaders());
  }

  getTotalUsers() {
    return this.http.get<number>(`${this.baseUrl}/total-users`, this.getAuthHeaders());
  }

  getTotalOrganizers() {
    return this.http.get<number>(`${this.baseUrl}/total-organizers`, this.getAuthHeaders());
  }
getMostRegisteredEvent(): Observable<{ name: string; registrations: number } | null> {
  return this.http.get<{ name: string; registrations: number }>(
    `${this.baseUrl}/most-registered-event`,
    this.getAuthHeaders()
  ).pipe(
    catchError((error: HttpErrorResponse) => {
      console.error('Error fetching most registered event:', error);
      return of(null);
    })
  );
}

// getRegistrationsPerMonth() {
//   return this.http.get<{month: string, count: number}[]>(
//     `${this.baseUrl}/registrations-per-month`, 
//     this.getAuthHeaders()
//   );
// }
getRegistrationsPerMonth(): Observable<{ [key: string]: number }> {
  return this.http.get<{ [key: string]: number }>(`${this.baseUrl}/registrations-per-month`, this.getAuthHeaders())
    .pipe(
      catchError(error => {
        console.error('Error loading registrations per month', error);
        return of({});  // ترجع كائن فارغ بدل الخطأ
      })
    );
}
}
