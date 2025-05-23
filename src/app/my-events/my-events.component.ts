// my-events.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-my-events',
  standalone: true,
  imports: [CommonModule, HttpClientModule, RouterModule],
  templateUrl: './my-events.component.html',
  styleUrls: ['./my-events.component.css']
})
export class MyEventsComponent implements OnInit {
  myEvents: any[] = [];
  isLoading = true;
  errorMessage = '';

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.fetchMyEvents();
  }

  fetchMyEvents() {
    this.http.get<any[]>('http://localhost:8989/api/Events/MyEvents')
      .subscribe({
        next: (events) => {
          this.myEvents = events;
          console.log('Events fetched:', this.myEvents);
          this.isLoading = false;
        },
        error: (err) => {
          this.errorMessage = 'Failed to load events. Please try again later.';
          console.error(err);
          this.isLoading = false;
        }
      });
  }

  deleteEvent(eventId: number) {
    if (!confirm('Are you sure you want to delete this event?')) return;

    this.http.delete(`http://localhost:8989/api/Events/${eventId}`, { responseType: 'text' })
      .subscribe({
        next: () => {
          this.myEvents = this.myEvents.filter(event => event.eventId !== eventId);
          console.log(`Event ${eventId} deleted successfully.`);
        },
        error: (err) => {
          this.errorMessage = 'Failed to delete event. Please try again.';
          console.error('Delete error:', err);
        }
      });
  }
}