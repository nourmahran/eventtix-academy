import { AuthService } from '../../../core/auth/auth.service';
import { safeReturnUrl } from '../../../core/auth/auth.guards';
import { UserRole } from '../../../core/models/user.model';

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  private readonly fb = new FormBuilder();

  readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  busy = false;
  error = '';
  async demo(role: UserRole): Promise<void> {
    if (this.busy) return;
    this.auth.startDemo(role);
    await this.router.navigateByUrl(safeReturnUrl(this.route.snapshot.queryParamMap.get('returnUrl')));
  }
  submitted = false;
  showPassword = false;

  loginForm = this.fb.nonNullable.group({
    username: [this.auth.rememberedUsername(), [
      Validators.required,
      Validators.minLength(3)
    ]],
    password: ['', [
      Validators.required,
      Validators.minLength(6)
    ]]
  });

  get username() {
    return this.loginForm.controls.username;
  }

  get password() {
    return this.loginForm.controls.password;
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  async onSubmit(): Promise<void> {
    if (this.busy) return;
    this.error = '';
    this.submitted = true;
    this.loginForm.markAllAsTouched();

    if (this.loginForm.invalid) {
      return;
    }

    this.busy = true;
    try {
      await this.auth.login(this.username.value, this.password.value);
      this.password.reset();
      await this.router.navigateByUrl(safeReturnUrl(this.route.snapshot.queryParamMap.get('returnUrl')));
    } catch (e) { this.error = e instanceof Error ? e.message : 'Sign in failed. Please try again.'; }
    finally { this.busy = false; }
  }
}
