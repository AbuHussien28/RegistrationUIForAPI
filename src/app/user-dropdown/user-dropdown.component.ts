// user-dropdown.component.ts
import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-dropdown',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './user-dropdown.component.html',
  styleUrls: ['./user-dropdown.component.css']
})
export class UserDropdownComponent {
  @Output() closeDropdown = new EventEmitter<void>();
  isOpen = false;

  constructor(private authService: AuthService, private router: Router) {}

  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
    this.closeDropdown.emit();
  }
}