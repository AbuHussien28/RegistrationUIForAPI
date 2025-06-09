import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { UserDropdownComponent } from "../user-dropdown/user-dropdown.component";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, UserDropdownComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  events: any[] = [];
  filteredEvents: any[] = [];

  // Pagination properties
  currentPage: number = 1;
  pageSize: number = 6;
  pagedEvents: any[] = [];
  totalPages: number = 1;

  searchTerm = '';
  filterStartDate: string = '';
  filterEndDate: string = '';

  // Mobile menu state
  mobileMenuOpen = false;

  private apiBaseUrl = 'http://localhost:8989/api';

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.fetchEvents();
  }

  // Close mobile menu when window is resized to desktop
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    if (event.target.innerWidth > 768 && this.mobileMenuOpen) {
      this.closeMobileMenu();
    }
  }

  // Prevent body scroll when mobile menu is open
  @HostListener('document:keydown.escape', ['$event'])
  onEscapeKey(event: KeyboardEvent) {
    if (this.mobileMenuOpen) {
      this.closeMobileMenu();
    }
  }

  fetchEvents() {
    this.http.get<any[]>(`${this.apiBaseUrl}/Events`).subscribe({
      next: (res) => {
        this.events = res;
        this.filteredEvents = [...this.events];
        this.updatePagination();
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

    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination() {
    this.totalPages = Math.ceil(this.filteredEvents.length / this.pageSize);
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.pagedEvents = this.filteredEvents.slice(start, end);
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  getPageNumbers(): (number | string)[] {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;
    
    if (this.totalPages <= maxVisiblePages) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      const startPage = Math.max(1, this.currentPage - 2);
      const endPage = Math.min(this.totalPages, this.currentPage + 2);
      
      if (startPage > 1) pages.push(1);
      if (startPage > 2) pages.push('...');
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      if (endPage < this.totalPages - 1) pages.push('...');
      if (endPage < this.totalPages) pages.push(this.totalPages);
    }
    
    return pages;
  }

  goToPage(page: number | string) {
    if (typeof page === 'number' && page !== this.currentPage) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  isPastEvent(endDate: string): boolean {
    const eventEnd = new Date(endDate);
    const today = new Date();

    eventEnd.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    return eventEnd < today;
  }

  registerToEvent(eventId: number) {
    const token = this.authService.getToken();
    if (!token) {
      alert('You must be logged in to register.');
      return;
    }

    const event = this.events.find(e => e.eventId === eventId);
    if (event && this.isPastEvent(event.endDate)) {
      alert('Cannot register for past events!');
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

    const headers = { Authorization: `Bearer ${token}` };

    this.http.post(`${this.apiBaseUrl}/Registration/BookEvent`, {
      userId,
      eventId
    }, { headers }).subscribe({
      next: () => alert('Registration successful!'),
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

  // Mobile menu methods
  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
    
    // Prevent body scroll when menu is open
    if (this.mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  closeMobileMenu() {
    this.mobileMenuOpen = false;
    document.body.style.overflow = '';
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}