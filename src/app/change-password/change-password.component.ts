import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css']
})
export class ChangePasswordComponent {
  formData = {
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  errorMessage = '';
  successMessage = '';
  isLoading = false;
  showPasswordRequirements = false;

  constructor(private authService: AuthService, public router: Router) {}

  togglePassword(fieldId: string) {
    const field = document.getElementById(fieldId) as HTMLInputElement;
    if (field.type === 'password') {
      field.type = 'text';
    } else {
      field.type = 'password';
    }
  }

  getPasswordStrength(): number {
    if (!this.formData.newPassword) return 0;
    
    let strength = 0;
    const password = this.formData.newPassword;

    // Length
    if (password.length >= 8) strength += 25;
    if (password.length >= 12) strength += 15;

    // Complexity
    if (/[A-Z]/.test(password)) strength += 20;
    if (/[a-z]/.test(password)) strength += 20;
    if (/[0-9]/.test(password)) strength += 20;
    if (/[^A-Za-z0-9]/.test(password)) strength += 20;

    return Math.min(100, strength);
  }

  getPasswordStrengthText(): string {
    const strength = this.getPasswordStrength();
    if (strength < 40) return 'Weak';
    if (strength < 70) return 'Medium';
    if (strength < 90) return 'Strong';
    return 'Very Strong';
  }

  getPasswordStrengthClass(): string {
    const strength = this.getPasswordStrength();
    if (strength < 40) return 'bg-danger';
    if (strength < 70) return 'bg-warning';
    if (strength < 90) return 'bg-info';
    return 'bg-success';
  }

  onSubmit() {
    this.errorMessage = '';
    this.successMessage = '';

    // Validation
    if (!this.formData.oldPassword || !this.formData.newPassword || !this.formData.confirmPassword) {
      this.errorMessage = 'Please fill in all fields.';
      return;
    }

    if (this.formData.newPassword !== this.formData.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    if (this.formData.newPassword.length < 8) {
      this.errorMessage = 'Password must be at least 8 characters long.';
      return;
    }

    if (!/(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/.test(this.formData.newPassword)) {
      this.errorMessage = 'Password must contain at least one uppercase letter, one lowercase letter, and one number.';
      return;
    }

    if (this.formData.oldPassword === this.formData.newPassword) {
      this.errorMessage = 'New password must be different from current password.';
      return;
    }

    this.isLoading = true;

    this.authService.changePassword({
      oldPassword: this.formData.oldPassword,
      newPassword: this.formData.newPassword,
      confirmPassword:this.formData.confirmPassword
    }).subscribe({
      next: (response) => {
        const res = response.body;
        this.successMessage = typeof res === 'string' ? res : 
                             (res as any)?.message || 'Password changed successfully!';
        
        // Reset form on success
        this.formData = {
          oldPassword: '',
          newPassword: '',
          confirmPassword: ''
        };
        
        setTimeout(() => {
          this.navigateToHome();
        }, 2000);
      },
      error: (err) => {
        console.error('Change password error:', err);
        this.errorMessage = typeof err.error === 'string' ? err.error : 
                           err.error?.message || 'Failed to change password. Please try again.';
      },
      complete: () => {
        this.isLoading = false;
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