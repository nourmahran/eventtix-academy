import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthService, SESSION_KEY } from './core/auth/auth.service';
import { SoundService } from './core/preferences/sound.service';
import { AdminEvents } from './features/events/pages/admin-events/admin-events';
import { EventService } from './features/events/services/event';
import { Payroll } from './features/finance/payroll/payroll';

// Top-level hook: applies to every spec so a saved sign-in never leaks between tests.
afterEach(() => sessionStorage.removeItem(SESSION_KEY));

const ACCOUNTS = 'eventtix.accounts.v1';
const signupData = {
  username: 'session_user', fullName: 'Session User', email: 'session@example.test', password: 'Passw0rd!x',
  preferences: { theme: 'dark' as const, notificationsEnabled: true, soundEnabled: false }
};

describe('Audit fixes: sign-in survives refresh via sessionStorage', () => {
  beforeEach(() => { localStorage.removeItem(ACCOUNTS); sessionStorage.removeItem(SESSION_KEY); });
  afterEach(() => localStorage.removeItem(ACCOUNTS));

  // A new AuthService instance stands in for a page reload.
  const reload = (): AuthService => TestBed.runInInjectionContext(() => new AuthService());

  it('restores a registered account after reload and stores no secrets', async () => {
    const auth = TestBed.inject(AuthService);
    await auth.signup(signupData);
    const raw = sessionStorage.getItem(SESSION_KEY)!;
    expect(raw).not.toContain('Passw0rd');
    expect(Object.keys(JSON.parse(raw))).toEqual(['userId']);
    const restored = reload();
    expect(restored.user()?.username).toBe('session_user');
    expect(restored.user()?.role).toBe('student');
  });

  it('never trusts a role edited into stored account data', async () => {
    const auth = TestBed.inject(AuthService);
    await auth.signup(signupData);
    const accounts = JSON.parse(localStorage.getItem(ACCOUNTS)!);
    accounts[0].user.role = 'admin';
    localStorage.setItem(ACCOUNTS, JSON.stringify(accounts));
    expect(reload().user()?.role).toBe('student');
  });

  it('restores demo roles and ignores unknown or tampered markers', () => {
    TestBed.inject(AuthService).startDemo('accounting');
    expect(reload().user()?.role).toBe('accounting');
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ demoRole: 'superuser' }));
    expect(reload().isAuthenticated()).toBeFalse();
    expect(sessionStorage.getItem(SESSION_KEY)).toBeNull();
    sessionStorage.setItem(SESSION_KEY, '{not json');
    expect(reload().isAuthenticated()).toBeFalse();
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ userId: 'deleted-account' }));
    expect(reload().isAuthenticated()).toBeFalse();
  });

  it('clears the session on logout', () => {
    const auth = TestBed.inject(AuthService);
    auth.startDemo('admin');
    auth.logout();
    expect(sessionStorage.getItem(SESSION_KEY)).toBeNull();
    expect(reload().isAuthenticated()).toBeFalse();
  });
});

describe('Audit fixes: admin event validation', () => {
  let admin: AdminEvents;
  beforeEach(() => {
    localStorage.removeItem('eventtix.events.v1');
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    admin = TestBed.runInInjectionContext(() => new AdminEvents());
    admin.form = { ...admin.emptyEvent(), title: 'Audit', location: 'GIU', price: 100, date: '2099-05-01', time: '10:00' };
  });
  afterEach(() => localStorage.removeItem('eventtix.events.v1'));

  it('rejects past dates for new events', () => {
    admin.form.date = '2020-01-01';
    admin.saveEvent();
    expect(admin.error).toMatch(/future/i);
    expect(TestBed.inject(EventService).getEvents().some(e => e.title === 'Audit')).toBeFalse();
  });

  it('explains invalid capacities', () => {
    for (const capacity of [0, 41, 2.5]) {
      admin.form.capacity = capacity;
      admin.saveEvent();
      expect(admin.error).toContain('whole number from 1 to 40');
    }
  });

  it('saves a valid future event', () => {
    admin.saveEvent();
    expect(admin.error).toBe('');
    expect(TestBed.inject(EventService).getEvents().some(e => e.title === 'Audit')).toBeTrue();
  });
});

describe('Audit fixes: feedback and reports', () => {
  it('plays a distinct falling tone for errors', async () => {
    const frequencies: number[] = [];
    const tone = { frequency: { setValueAtTime: (v: number) => frequencies.push(v) }, connect: () => {}, start: () => {}, stop: () => {}, disconnect: () => {} };
    const gain = { gain: { setValueAtTime: () => {}, linearRampToValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} }, connect: () => {}, disconnect: () => {} };
    TestBed.configureTestingModule({ providers: [{ provide: AuthService, useValue: { user: () => ({ preferences: { soundEnabled: true } }) } }] });
    const sound = TestBed.inject(SoundService);
    (sound as any).context = { resume: () => Promise.resolve(), createOscillator: () => tone, createGain: () => gain, currentTime: 0, destination: {} };
    await sound.error();
    expect(frequencies).toEqual([330, 220]);
  });

  it('rounds payroll report totals to cents', async () => {
    localStorage.removeItem('eventtix.payroll.v1');
    const payroll = new Payroll();
    payroll.staff = [
      { id: 'a', name: 'A', position: 'P', basicSalary: 0.1, allowances: 0, deductions: 0, eventAllowances: [] },
      { id: 'b', name: 'B', position: 'P', basicSalary: 0.2, allowances: 0, deductions: 0, eventAllowances: [] }
    ];
    let blob: Blob | undefined;
    spyOn(URL, 'createObjectURL').and.callFake((b: Blob | MediaSource) => { blob = b as Blob; return 'blob:test'; });
    spyOn(HTMLAnchorElement.prototype, 'click');
    payroll.exportReport();
    const report = JSON.parse(await blob!.text());
    expect(report.totalPayroll).toBe(0.3);
  });
});
