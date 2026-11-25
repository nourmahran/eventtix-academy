import { WorkspaceNav } from './layout/workspace-nav';
import { HelpWidget } from './shared/help/help-widget';
import { AppearanceService } from './core/preferences/appearance.service';
import { AuthService } from './core/auth/auth.service';

import { Component, effect, inject } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { Navbar } from './layout/navbar/navbar';
import { ToastHost } from './shared/toast/toast-host';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, Navbar, HelpWidget, WorkspaceNav, ToastHost],
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
