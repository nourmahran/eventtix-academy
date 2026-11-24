import { AuthService } from '../../core/auth/auth.service';

import { Component, inject, HostListener } from '@angular/core';
import {
  Router,
  RouterLink,
  RouterLinkActive
} from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss'
})
export class Navbar {
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  logoutError = '';
  signingOut = false;

  async logout(): Promise<void> {
    if (this.signingOut) return;
    this.signingOut = true;
    this.logoutError = '';
    try {
      await this.auth.logout();
      this.closeMenu();
      await this.router.navigateByUrl('/login');
    } catch (error) {
      this.logoutError = error instanceof Error ? error.message : 'Unable to sign out.';
    } finally {
      this.signingOut = false;
    }
  }
  menuOpen = false;

  @HostListener('document:keydown.escape') closeOnEscape(): void { this.closeMenu(); }
  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu(): void {
    this.menuOpen = false;
  }
}
