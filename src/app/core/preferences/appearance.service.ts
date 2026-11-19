import { DOCUMENT } from '@angular/common';
import { inject, Injectable, signal } from '@angular/core';

/** A non-sensitive display preference is the only value saved in a cookie. */
@Injectable({ providedIn: 'root' })
export class AppearanceService {
  private readonly document = inject(DOCUMENT);
  readonly theme = signal<'dark' | 'light'>(this.read());

  private read(): 'dark' | 'light' {
    return this.document.cookie.split(';').some(part => part.trim() === 'eventtix_theme=light') ? 'light' : 'dark';
  }

  apply(theme: 'dark' | 'light'): void {
    this.theme.set(theme);
    this.document.documentElement.dataset['theme'] = theme;
    this.document.cookie = `eventtix_theme=${theme}; Path=/; Max-Age=31536000; SameSite=Lax${this.document.location.protocol === 'https:' ? '; Secure' : ''}`;
  }
}
