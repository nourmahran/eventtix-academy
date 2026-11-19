# Testing guide (Jasmine + Karma)

How we write and run unit tests in this project (Angular, standalone components).

## Run the tests

```bash
npm run test:ci
```

Runs every spec once in headless Chrome and exits. Run this before every push.

```bash
ng test
```

Watch mode in a browser window, for use while you develop. It reruns when you save.

If Karma says it cannot find Chrome, set the `CHROME_BIN` environment variable to the path of `chrome.exe` (or `msedge.exe`) on your machine.

## Rules

1. Every component and service has a `.spec.ts` file next to it.
2. Run `npm run test:ci` before every push. Do not push with failing tests.
3. Keep specs independent. Clear storage in `beforeEach`, and never rely on the order tests run in.
4. Do not call real network or payment services. Use spies or stubs.
5. Name tests so they read as sentences: `it('shows an error when the email is invalid')`.

## Template: service

```ts
import { TestBed } from '@angular/core/testing';
import { StorageService } from '../../shared/services/storage.service'; // adjust the path

describe('StorageService', () => {
  let service: StorageService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(StorageService);
  });

  it('saves and reads a value', () => {
    service.setLocal('eventtix.demo.v1', { a: 1 });
    expect(service.getLocal<{ a: number }>('eventtix.demo.v1')).toEqual({ a: 1 });
  });

  it('returns null for a missing key', () => {
    expect(service.getLocal('eventtix.missing.v1')).toBeNull();
  });
});
```

## Template: standalone component

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { EventList } from './event-list'; // replace with your component

describe('EventList', () => {
  let component: EventList;
  let fixture: ComponentFixture<EventList>;

  beforeEach(async () => {
    localStorage.clear(); // components that use AuthService read browser storage
    sessionStorage.clear();

    await TestBed.configureTestingModule({
      providers: [provideRouter([])], // needed if the template uses routerLink
      imports: [EventList],           // standalone components go in imports
    }).compileComponents();

    fixture = TestBed.createComponent(EventList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render a heading', () => {
    const heading = fixture.nativeElement.querySelector('h1');
    expect(heading?.textContent).toContain('Events');
  });
});
```

## Useful snippets

- Spy on a method: `spyOn(service, 'save').and.returnValue(true);`
- Check a call: `expect(service.save).toHaveBeenCalledWith(data);`
- Click a button: `fixture.nativeElement.querySelector('button').click(); fixture.detectChanges();`
- Fake a signed-in user (check the real shape in `core/auth/auth.service.ts`):
  `{ provide: AuthService, useValue: { user: () => ({ id: 'u1', role: 'student' }) } }`

## What to test

- Member 1: signup and login validation, guards, profile saving.
- Member 2: seat availability, discount calculation, ticket checkout, QR data.
- Member 3: invoice totals, payroll (salary + allowances - deductions), budget summaries.
- Everyone: form validation and role/guard behaviour for your routes.

## Coverage (run near the end of the project)

```bash
npm run test:ci -- --code-coverage
```

Writes a `coverage/` folder. Open `coverage/index.html` for the report. Do not commit this folder.