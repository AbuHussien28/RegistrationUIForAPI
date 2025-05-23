import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  events: any[] = [];
  filteredEvents: any[] = [];
  searchTerm = '';
  filterStartDate: string = '';
  filterEndDate: string = '';

  private apiBaseUrl = 'http://localhost:8989/api';

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.fetchEvents();
  }

  fetchEvents() {
    this.http.get<any[]>(`${this.apiBaseUrl}/Events`).subscribe({
      next: (res) => {
        this.events = res;
        this.filteredEvents = [...this.events];
      },
      error: (err) => {
        console.error('Error fetching events:', err);
      }
    });
  }

  filterEvents() {
    this.filteredEvents = this.events.filter(e => {
      const matchesSearch = e.title.toLowerCase().includes(this.searchTerm.toLowerCase()) || 
                          (e.description && e.description.toLowerCase().includes(this.searchTerm.toLowerCase()));
      
      const eventStart = new Date(e.startDate).toISOString().split('T')[0];
      const eventEnd = new Date(e.endDate).toISOString().split('T')[0];

      const matchesStartDate = this.filterStartDate ? eventStart >= this.filterStartDate : true;
      const matchesEndDate = this.filterEndDate ? eventEnd <= this.filterEndDate : true;

      return matchesSearch && matchesStartDate && matchesEndDate;
    });
  }

  registerToEvent(eventId: number) {
    const token = this.authService.getToken();
    if (!token) {
      alert('You must be logged in to register.');
      return;
    }

    let userId: string | null = null;
    try {
      const payload: any = JSON.parse(atob(token.split('.')[1]));
      userId = payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];
    } catch (error) {
      console.error('Error parsing token:', error);
      alert('Invalid token. Please login again.');
      return;
    }

    if (!userId) {
      alert('User ID not found in token.');
      return;
    }

    const headers = {
      Authorization: `Bearer ${token}`
    };

    this.http.post(`${this.apiBaseUrl}/Registration/BookEvent`, {
      userId: userId,
      eventId: eventId
    }, { headers }).subscribe({
      next: () => {
        alert('Registration successful!');
      },
      error: (err) => {
        console.error('Registration error:', err);
        const serverMessage = err.error?.message || 'Please try again later.';
        alert(`Registration failed: ${serverMessage}`);
      }
    });
  }

  goToUserRegistrations() {
    this.router.navigate(['/user-register']);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}