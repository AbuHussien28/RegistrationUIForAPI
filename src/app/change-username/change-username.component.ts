import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-change-username',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './change-username.component.html',
  styleUrls: ['./change-username.component.css']
})
export class ChangeUsernameComponent implements OnInit {
  formData = {
    newUsername: ''
  };

  isLoading = false;
  errorMessage = '';
  successMessage = '';
  currentUsername = '';

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.loadCurrentUsername();
  }

  loadCurrentUsername(): void {
    this.isLoading = true;
    this.authService.getCurrentUsername().pipe(
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: (username: string) => {
        this.currentUsername = username;
        this.formData.newUsername = username;
      },
      error: () => {
        this.errorMessage = 'Failed to load current username.';
      }
    });
  }

  onSubmit(): void {
    const trimmedUsername = this.formData.newUsername.trim();

    if (!trimmedUsername || trimmedUsername.length < 3) {
      this.errorMessage = 'Username must be at least 3 characters long.';
      return;
    }

    if (trimmedUsername === this.currentUsername) {
      this.errorMessage = 'This is already your current username.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const payload = { newUserName: trimmedUsername };

    this.authService.changeUsername(payload).pipe(
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: (response) => {
        // Optional: save new token from headers if backend sends it
        if (response.headers?.get('Authorization')) {
          const newToken = response.headers.get('Authorization')!.replace('Bearer ', '');
          this.authService.saveToken(newToken);
        }

        this.successMessage = typeof response.body === 'string'
          ? response.body
          : 'Username changed successfully!';
        this.currentUsername = trimmedUsername;

        setTimeout(() => {
          const role = this.authService.getRoleFromToken();
          switch (role) {
            case 'Admin':
             this.router.navigate(['/dashboard']);
              break;
            case 'Organizer':
             this.router.navigate(['/my-events']);
              break;
            case 'User':
            this.router.navigate(['/home']);
              break;
            default:
              this.router.navigate(['/access-denied']);
              break;
          }
        }, 2000);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to change username. Please try again.';
      }
    });
  }

navigateToHome(): void {
  const role = this.authService.getRoleFromToken();

  switch (role) {
    case 'Admin':
      this.router.navigate(['/dashboard']);
      break;
    case 'Organizer':
      this.router.navigate(['/my-events']);
      break;
    case 'User':
      this.router.navigate(['/home']);
      break;
    default:
      this.router.navigate(['/access-denied']);
      break;
  }
}

}
