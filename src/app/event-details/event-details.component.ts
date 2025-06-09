import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-event-details',
  standalone: true,
  templateUrl: './event-details.component.html',
  imports: [CommonModule, RouterModule, HttpClientModule]
})
export class EventDetailsComponent implements OnInit {
  event: any;
  isLoading = true;
  errorMessage = '';
  eventStatus = '';

  constructor(
    private http: HttpClient, 
    private route: ActivatedRoute, 
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadEvent();
  }

  loadEvent(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.isLoading = true;
    this.errorMessage = '';
    
    this.http.get(`http://localhost:8989/api/Events/${id}`).subscribe({
      next: (res: any) => {
        this.event = res;
        this.isLoading = false;
        this.calculateEventStatus();
      },
      error: (err) => {
        this.errorMessage = 'Failed to load event details. Please try again.';
        console.error(err);
        this.isLoading = false;
      }
    });
  }

  calculateEventStatus(): void {
    if (!this.event) return;
    
    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const startDate = new Date(this.event.startDate);
    const startDateOnly = new Date(startDate);
    startDateOnly.setHours(0, 0, 0, 0);
    
    const endDate = new Date(this.event.endDate);
    const endDateOnly = new Date(endDate);
    endDateOnly.setHours(0, 0, 0, 0);

    // Check if today is the event day
    if (startDateOnly.getTime() === today.getTime()) {
      this.eventStatus = 'Today';
    } 
    // Check if event is in the future
    else if (now < startDate) {
      this.eventStatus = 'Upcoming';
    } 
    // Check if event is currently ongoing
    else if (now >= startDate && now <= endDate) {
      this.eventStatus = 'Ongoing';
    } 
    // Event has passed
    else {
      this.eventStatus = 'Expired';
    }
  }

  retryLoading(): void {
    this.loadEvent();
  }

  goToHome(): void {
    this.router.navigate(['/home']);
  }

  deleteEvent(): void {
    if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) return;

    this.http.delete(`http://localhost:8989/api/Events/${this.event.eventId}`, { responseType: 'text' }).subscribe({
      next: () => {
        alert('Event deleted successfully!');
        this.router.navigate(['/my-events']);
      },
      error: (err) => {
        this.errorMessage = 'Failed to delete the event. Please try again.';
        console.error(err);
      }
    });
  }
}