import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-create-event',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-event.component.html'
})
export class CreateEventComponent {
  event = {
    title: '',
    description: '',
    location: '',
    startDate: '',
    endDate: ''
  };

  errorMessage = '';
  isLoading = false;

  constructor(private http: HttpClient, private router: Router) {}

  createEvent() {
    if (new Date(this.event.endDate) <= new Date(this.event.startDate)) {
      this.errorMessage = 'End Date must be after Start Date.';
      return;
    }

    this.errorMessage = '';
    this.isLoading = true;

    const token = localStorage.getItem('token');
    const headers = token
      ? new HttpHeaders().set('Authorization', `Bearer ${token}`)
      : undefined;

    this.http.post('http://localhost:8989/api/Events', this.event, { headers }).subscribe({
      next: () => this.router.navigate(['/my-events']),
      error: err => {
        this.errorMessage = 'Failed to create event.';
        console.error(err);
        this.isLoading = false;
      }
    });
  }
}
