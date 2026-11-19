import { TestBed } from '@angular/core/testing';
import { AppearanceService } from './appearance.service';

describe('Appearance storage', () => {
  afterEach(() => {
    document.cookie = 'eventtix_theme=; Path=/; Max-Age=0';
    delete document.documentElement.dataset['theme'];
  });

  it('restores the display preference from a cookie and applies it', () => {
    document.cookie = 'eventtix_theme=light; Path=/';
    const appearance = TestBed.inject(AppearanceService);
    expect(appearance.theme()).toBe('light');
    appearance.apply('dark');
    expect(document.documentElement.dataset['theme']).toBe('dark');
    expect(document.cookie).toContain('eventtix_theme=dark');
  });
});
