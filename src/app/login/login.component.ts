// src/app/login/login.component.ts

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginData = {
    userName: '',
    password: ''
  };
  isLoading = false;
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  login() {
    if (!this.loginData.userName || !this.loginData.password) {
      this.errorMessage = 'Please enter both username and password';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.loginData).subscribe({
      next: (res: any) => {
        this.authService.saveToken(res.token);
        const role = this.authService.getRoleFromToken();

          if (role === 'Organizer') {
            this.router.navigate(['/my-events']);
           }  else if (role === 'User') {
                 this.router.navigate(['/home']);
            }else {
              this.router.navigate(['/dashboard']);
            }
      },
      error: (err) => {
        this.errorMessage = 'Login failed. Please check your credentials and try again.';
        console.error('Login error:', err);
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  navigateToSignUp() {
    this.router.navigate(['/signup']);
  }
}
