import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NotificationService } from '../services/notification.service';
import { ToastHost } from './toast-host';

describe('ToastHost', () => {
  let fixture: ComponentFixture<ToastHost>;
  let notifications: NotificationService;
  let host: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ToastHost] }).compileComponents();
    notifications = TestBed.inject(NotificationService);
    fixture = TestBed.createComponent(ToastHost);
    host = fixture.nativeElement;
    fixture.detectChanges();
  });

  afterEach(() => notifications.clear());

  it('shows nothing when there are no notifications', () => {
    expect(host.querySelectorAll('.toast').length).toBe(0);
  });

  it('renders a success message', () => {
    notifications.success('Saved');
    fixture.detectChanges();
    const toast = host.querySelector('.toast');
    expect(toast?.textContent).toContain('Saved');
    expect(toast?.getAttribute('data-kind')).toBe('success');
    expect(toast?.getAttribute('role')).toBe('status');
  });

  it('marks errors as alerts', () => {
    notifications.error('Something failed');
    fixture.detectChanges();
    expect(host.querySelector('.toast')?.getAttribute('role')).toBe('alert');
  });

  it('removes a toast when its close button is clicked', () => {
    notifications.info('Hello');
    fixture.detectChanges();
    (host.querySelector('.toast-close') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(host.querySelectorAll('.toast').length).toBe(0);
  });
});