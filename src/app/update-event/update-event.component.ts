import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
@Component({
  selector: 'app-event-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
templateUrl: './update-event.component.html'
})
export class EventEditComponent implements OnInit {
  event: any;
  isLoading = true;
  errorMessage = '';

  constructor(private http: HttpClient, private route: ActivatedRoute, private router: Router) {}

ngOnInit(): void {
  const id = this.route.snapshot.paramMap.get('id');
  this.http.get(`http://localhost:8989/api/Events/${id}`).subscribe({
    next: (res: any) => {
      // تعبي القيم الناقصة بشكل مؤقت
      res.description = res.description || '';  // أو قيمة افتراضية
      res.endDate = res.endDate || res.startDate; // أو تاريخ افتراضي (مثل نفس تاريخ البداية)
      
      // تحويل التواريخ لصيغة متوافقة مع datetime-local
      res.startDate = this.formatDateForInput(res.startDate);
      res.endDate = this.formatDateForInput(res.endDate);

      this.event = res;
      this.isLoading = false;
    },
    error: (err) => {
      this.errorMessage = 'Failed to load event for editing.';
      console.error(err);
      this.isLoading = false;
    }
  });
}


formatDateForInput(dateStr: string): string {
  const date = new Date(dateStr);
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - (offset*60*1000)); // تحويل للتوقيت المحلي
  return localDate.toISOString().slice(0,16);
}
updateEvent() {
  if (new Date(this.event.endDate) <= new Date(this.event.startDate)) {
    this.errorMessage = 'EndDate must be after StartDate.';
    return;
  }

  const token = (typeof window !== 'undefined') ? localStorage.getItem('token') : null;

  this.http.put(`http://localhost:8989/api/Events/${this.event.eventId}`, this.event, {
    headers: {
      Authorization: token ? `Bearer ${token}` : ''
    }
  }).subscribe({
    next: () => this.router.navigate(['/event', this.event.eventId]),
    error: (err) => {
      this.errorMessage = 'Failed to update the event.';
      console.error(err);
    }
  });
}


}