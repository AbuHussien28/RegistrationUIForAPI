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
  imports: [CommonModule, RouterModule,HttpClientModule]  // ✅ Add these
})
export class EventDetailsComponent implements OnInit {
  event: any;
  isLoading = true;
  errorMessage = '';

  constructor(private http: HttpClient, private route: ActivatedRoute, private router: Router) {}

ngOnInit(): void {
  const id = this.route.snapshot.paramMap.get('id');
  this.http.get(`http://localhost:8989/api/Events/${id}`).subscribe({
    next: (res) => {
      this.event = res;
      this.isLoading = false;
    },
    error: (err) => {
      this.errorMessage = 'Failed to load event details';
      console.error(err);
      this.isLoading = false;
    }
  });
}

deleteEvent() {
  if (!confirm('Are you sure you want to delete this event?')) return;

  this.http.delete(`http://localhost:8989/api/Events/${this.event.eventId}`,{ responseType: 'text' }).subscribe({
    next: () => this.router.navigate(['/my-events']),
    error: (err) => {
      this.errorMessage = 'Failed to delete the event.';
      console.error(err);
    }
  });
}
}
