// app.component.ts
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet], // Add RouterOutlet to imports
  template: `
    <router-outlet></router-outlet>
  `,
})
export class AppComponent {
  title = 'UIRegistration';
}