import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Chart, registerables } from 'chart.js';
import { DashboardService } from '../services/dashboard.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  totalRegistrations = 0;
  totalEvents = 0;
  totalUsers = 0;
  totalOrganizers = 0;
  mostRegisteredEvent: any = null;
  registrationsPerMonth: any[] = [];
  timeFilter = 'month';
  currentView = 'chart';
  isLoading = false;
  @ViewChild('eventChart') private eventChartRef!: ElementRef;
  @ViewChild('monthlyChart') private monthlyChartRef!: ElementRef;
  private eventChart?: Chart;
  private monthlyChart?: Chart;

  constructor(
    private dashboardService: DashboardService,
    private cdRef: ChangeDetectorRef
  ) {
    Chart.register(...registerables);
  }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.isLoading = true;
    forkJoin({
      registrations: this.dashboardService.getTotalRegistrations(),
      events: this.dashboardService.getTotalEvents(),
      users: this.dashboardService.getTotalUsers(),
      organizers: this.dashboardService.getTotalOrganizers(),
      mostRegistered: this.dashboardService.getMostRegisteredEvent(),
      monthlyRegistrations: this.dashboardService.getRegistrationsPerMonth()
    }).subscribe({
      next: (results) => {
        this.totalRegistrations = results.registrations;
        this.totalEvents = results.events;
        this.totalUsers = results.users;
        this.totalOrganizers = results.organizers;
        this.mostRegisteredEvent = results.mostRegistered;
        this.registrationsPerMonth = Object.keys(results.monthlyRegistrations).map(key => ({
          month: key,
          count: results.monthlyRegistrations[key]
        }));

        this.isLoading = false;
              this.cdRef.detectChanges();
        
        setTimeout(() => {
          this.createCharts();
        }, 0);
      },
      error: (err) => {
        console.error('Error loading dashboard data:', err);
        this.isLoading = false;
      }
    });
  }

  createCharts() {
    this.createEventChart();
    this.createMonthlyChart();
  }

  refreshData() {
    this.loadDashboardData();
  }

  changeView(view: string) {
    this.currentView = view;
    if (view === 'chart') {
      setTimeout(() => this.createMonthlyChart(), 0);
    }
  }

  createEventChart() {
    if (!this.eventChartRef?.nativeElement || !this.mostRegisteredEvent) return;

    if (this.eventChart) {
      this.eventChart.destroy();
    }

    const ctx = this.eventChartRef.nativeElement.getContext('2d');
    this.eventChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Registered', 'Remaining'],
        datasets: [{
          data: [
            this.mostRegisteredEvent.registrations, 
            (this.mostRegisteredEvent.capacity || 100) - this.mostRegisteredEvent.registrations
          ],
          backgroundColor: ['#3498db', '#ecf0f1'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '75%',
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    });
  }

  createMonthlyChart() {
    if (!this.monthlyChartRef?.nativeElement || this.registrationsPerMonth.length === 0) return;

    if (this.monthlyChart) {
      this.monthlyChart.destroy();
    }

    const ctx = this.monthlyChartRef.nativeElement.getContext('2d');
    this.monthlyChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: this.registrationsPerMonth.map(item => item.month),
        datasets: [{
          label: 'Registrations',
          data: this.registrationsPerMonth.map(item => item.count),
          backgroundColor: '#3498db',
          borderColor: '#2980b9',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  calculateGrowth(index: number): number {
    if (index === 0 || this.registrationsPerMonth.length <= 1) return 0;
    const current = this.registrationsPerMonth[index].count;
    const previous = this.registrationsPerMonth[index - 1].count;
    if (previous === 0) return 0;
    return Math.round(((current - previous) / previous) * 100);
  }

  getGrowthClass(index: number): string {
    const growth = this.calculateGrowth(index);
    if (growth > 0) return 'positive';
    if (growth < 0) return 'negative';
    return 'neutral';
  }

  getGrowthIcon(index: number): string {
    const growth = this.calculateGrowth(index);
    if (growth > 0) return 'fas fa-arrow-up';
    if (growth < 0) return 'fas fa-arrow-down';
    return 'fas fa-minus';
  }
}