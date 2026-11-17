import { AppearanceService } from './core/preferences/appearance.service';
import { AuthService } from './core/auth/auth.service';

import { Component, effect, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './layout/navbar/navbar';
import { Chatbot } from './shared/chatbot/chatbot';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Navbar, Chatbot],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  private readonly appearance = inject(AppearanceService);
  private readonly auth = inject(AuthService);
  constructor() {
    effect(() => this.appearance.apply(this.auth.user()?.preferences.theme ?? this.appearance.theme()));
  }
  protected readonly title = 'eventtix-academy';
}
