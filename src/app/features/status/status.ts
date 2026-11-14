import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
@Component({ selector: 'app-status', imports: [RouterLink], template: `<main class="auth-page"><section class="auth-card"><div class="auth-heading"><h1>{{ title }}</h1><p>{{ message }}</p></div><p class="signup-link"><a routerLink="/">Back to home</a> · <a routerLink="/profile">Your profile</a></p></section></main>`, styleUrl: '../auth/login/login.scss' })
export class Status {
  private readonly route = inject(ActivatedRoute);
  readonly title = this.route.snapshot.data['heading'];
  readonly message = this.route.snapshot.data['message'];
}
