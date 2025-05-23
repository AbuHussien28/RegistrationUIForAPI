import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-deleted-events',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './deleted-events.component.html',
  styleUrls: ['./deleted-events.component.css']
})
export class DeletedEventsComponent implements OnInit {
  deletedEvents: any[] = [];
  isLoading = true;
  errorMessage = '';

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.fetchDeletedEvents();
  }

fetchDeletedEvents() {
  const token = localStorage.getItem('token');
  if (!token) {
    this.errorMessage = 'You must be logged in to view deleted events.';
    this.isLoading = false;
    return;
  }

  this.http.get<any[]>('http://localhost:8989/api/Events/Deleted', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  }).subscribe({
    next: (events) => {
      this.deletedEvents = events;
      this.isLoading = false;
    },
    error: (err) => {
      console.error('Error loading deleted events:', err);
      this.errorMessage = 'Failed to load deleted events: ' + (err.message || err.statusText);
      this.isLoading = false;
    }
  });
}


  restoreEvent(eventId: number) {
  const token = localStorage.getItem('token');
  if (!token) {
    alert('You must be logged in to restore events.');
    return;
  }

  this.http.put(`http://localhost:8989/api/Events/restore/${eventId}`, {}, {
    responseType: 'text',
    headers: {
      Authorization: `Bearer ${token}`
    }
  }).subscribe({
    next: () => {
      this.deletedEvents = this.deletedEvents.filter(event => event.eventId !== eventId);
    },
    error: (err) => {
      console.error('Restore error:', err);
      alert('Failed to restore event.');
    }
  });
}
  goBackToMyEvents() {
    this.router.navigate(['/my-events']);
  }
}