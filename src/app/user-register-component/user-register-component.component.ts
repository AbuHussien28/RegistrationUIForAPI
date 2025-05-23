// user-register-component.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

interface Registration {
  registrationId: number;
  eventId: number;
  userId: string;
  userName: string;
  eventName: string;
  registrationDate: string;
}

@Component({
  selector: 'app-user-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-register-component.component.html',
  styleUrls: ['./user-register-component.component.css']
})
export class UserRegisterComponent implements OnInit {
  registrations: Registration[] | undefined;
  private apiUrl = 'http://localhost:8989/api/Registration/myRegistrations';

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.getMyRegistrations();
  }

  getMyRegistrations(): void {
    const token = localStorage.getItem('token'); 

    if (!token) {
      console.error('No token found');
      this.router.navigate(['/login']);
      return;
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    this.http.get<Registration[]>(this.apiUrl, { headers })
      .subscribe({
        next: data => this.registrations = data,
        error: err => {
          console.error('Error fetching registrations:', err);
          this.registrations = []; 
        }
      });
  }

  viewEvent(eventId: number): void {
    this.router.navigate(['/event', eventId]);
  }

  returnToHome(): void {
    this.router.navigate(['/home']);
  }
}