import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { AuthService, defaultPreferences } from './auth.service';
import { safeReturnUrl } from './auth.guards';
import { Signup } from '../../features/auth/signup/signup';
import { routes } from '../../app.routes';

describe('Demo authentication and routing', () => {
  let auth: AuthService;
  beforeEach(() => {
    localStorage.removeItem('eventtix.accounts.v1');
    sessionStorage.removeItem('eventtix.lastUsername');
    TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
    auth = TestBed.inject(AuthService);
  });
  afterEach(() => { localStorage.removeItem('eventtix.accounts.v1'); sessionStorage.removeItem('eventtix.lastUsername'); });
  const data = { username: 'student_one', fullName: 'Student One', email: 'student@example.test', password: 'Unique-demo-123', preferences: defaultPreferences };

  it('registers, stores no plaintext password, rejects wrong passwords, and signs in after logout', async () => {
    await auth.signup(data);
    expect(auth.user()?.role).toBe('student');
    expect(localStorage.getItem('eventtix.accounts.v1')).not.toContain(data.password);
    auth.logout();
    expect(auth.user()).toBeNull();
    await expectAsync(auth.login(data.username, 'incorrect')).toBeRejected();
    await auth.login(' STUDENT_ONE ', data.password);
    expect(auth.user()?.username).toBe(data.username);
  });

  it('rejects duplicates and ignores persisted role escalation', async () => {
    await auth.signup(data);
    await expectAsync(auth.signup({ ...data, username: 'STUDENT_ONE' })).toBeRejected();
    const accounts = JSON.parse(localStorage.getItem('eventtix.accounts.v1')!);
    accounts[0].user.role = 'admin';
    localStorage.setItem('eventtix.accounts.v1', JSON.stringify(accounts));
    auth.logout();
    await auth.login(data.username, data.password);
    expect(auth.hasRole(['admin'])).toBeFalse();
  });

  it('saves profile fields and preferences across sign-ins', async () => {
    await auth.signup(data);
    auth.updateProfile('Updated Name', 'updated@example.test', { ...defaultPreferences, soundEnabled: true });
    auth.logout();
    await auth.login(data.username, data.password);
    expect(auth.user()?.fullName).toBe('Updated Name');
    expect(auth.user()?.preferences.soundEnabled).toBeTrue();
  });

  it('fails clearly on malformed storage without overwriting it', async () => {
    localStorage.setItem('eventtix.accounts.v1', '{broken');
    await expectAsync(auth.login('student', 'password')).toBeRejectedWithError(/storage/);
    expect(localStorage.getItem('eventtix.accounts.v1')).toBe('{broken');
  });

  it('redirects guests, enforces roles, and renders unknown routes', async () => {
    const harness = await RouterTestingHarness.create('/profile');
    expect(TestBed.inject(Router).url).toContain('/login?returnUrl=');
    auth.startDemo('student');
    await harness.navigateByUrl('/admin');
    expect(TestBed.inject(Router).url).toBe('/forbidden');
    auth.startDemo('accounting');
    await harness.navigateByUrl('/accounting');
    expect(harness.routeNativeElement?.textContent).toContain('Accounting demo');
    await harness.navigateByUrl('/admin');
    expect(TestBed.inject(Router).url).toBe('/forbidden');
    auth.startDemo('admin');
    await harness.navigateByUrl('/admin');
    expect(harness.routeNativeElement?.textContent).toContain('Administration demo');
    await harness.navigateByUrl('/login');
    expect(TestBed.inject(Router).url).toBe('/profile');
    auth.logout();
    await harness.navigateByUrl('/unknown');
    expect(harness.routeNativeElement?.textContent).toContain('Page not found');
  });

  it('validates signup and completes the form-to-profile flow', async () => {
    const harness = await RouterTestingHarness.create();
    const signup = await harness.navigateByUrl('/signup', Signup);
    await signup.onSubmit();
    expect(signup.form.invalid).toBeTrue();
    expect(auth.user()).toBeNull();
    signup.form.setValue({ fullName: data.fullName, username: data.username, email: data.email, password: data.password, confirmPassword: 'mismatch', acceptTerms: true, profilePictureUrl: '', paymentMethodLabel: '', theme: 'dark', notificationsEnabled: true, soundEnabled: false });
    await signup.onSubmit();
    expect(signup.form.hasError('mismatch')).toBeTrue();
    signup.form.controls.confirmPassword.setValue(data.password);
    await signup.onSubmit();
    expect(TestBed.inject(Router).url).toBe('/profile');
    expect(signup.form.controls.password.value).toBe('');
  });

  it('does not authenticate if account storage cannot be written', async () => {
    spyOn(Storage.prototype, 'setItem').and.throwError('Storage blocked');
    await expectAsync(auth.signup(data)).toBeRejectedWithError(/Unable to save/);
    expect(auth.user()).toBeNull();
  });

  it('persists photo, sample card and signup preferences without persisting authentication', async () => {
    const picture = 'data:image/png;base64,aGVsbG8=';
    await auth.signup({ ...data, profilePictureUrl: picture, paymentMethodLabel: 'Demo Visa •••• 4242', preferences: { theme: 'light', notificationsEnabled: false, soundEnabled: true } });
    auth.logout();
    expect(auth.rememberedUsername()).toBe(data.username);
    await auth.login(data.username, data.password);
    expect(auth.user()?.profilePictureUrl).toBe(picture);
    expect(auth.user()?.paymentMethodLabel).toBe('Demo Visa •••• 4242');
    expect(auth.user()?.preferences.theme).toBe('light');
    auth.updateProfile(data.fullName, data.email, defaultPreferences, { profilePictureUrl: '', paymentMethodLabel: '' });
    auth.logout();
    await auth.login(data.username, data.password);
    expect(auth.user()?.profilePictureUrl).toBe('');
    expect(auth.user()?.paymentMethodLabel).toBe('');
    expect(new AuthService().isAuthenticated()).toBeFalse();
  });

  it('rejects arbitrary card details and external photo URLs', async () => {
    await expectAsync(auth.signup({ ...data, paymentMethodLabel: '4111111111111111' })).toBeRejectedWithError(/sample cards/);
    await expectAsync(auth.signup({ ...data, profilePictureUrl: 'https://example.com/photo.jpg' })).toBeRejectedWithError(/profile picture/);
    expect(localStorage.getItem('eventtix.accounts.v1')).toBeNull();
  });

  it('does not expose or modify another account through profile updates', async () => {
    await auth.signup(data);
    auth.logout();
    await auth.signup({ ...data, username: 'second_student', email: 'second@example.test' });
    expect(() => auth.updateProfile('Student Two', data.email, defaultPreferences)).toThrowError(/already registered/);
    auth.updateProfile('Student Two', 'second@example.test', defaultPreferences);
    auth.logout();
    await auth.login(data.username, data.password);
    expect(auth.user()?.fullName).toBe(data.fullName);
  });

  it('rejects unsafe return destinations', () => {
    for (const value of ['//example.com', 'https://example.com', '/\\example.com', '/login', '/signup?x=1']) expect(safeReturnUrl(value)).toBe('/profile');
    expect(safeReturnUrl('/accounting?tab=fees')).toBe('/accounting?tab=fees');
  });
});
