import { DEMO_PAYMENT_METHODS } from '../../../core/auth/profile-options';
import { PhotoPicker } from '../../../shared/photo-picker/photo-picker';
import { UserPreferences } from '../../../core/models/user.model';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
@Component({ selector: 'app-signup', imports: [ReactiveFormsModule, RouterLink, PhotoPicker], templateUrl: './signup.html', styleUrl: './signup.scss' })
export class Signup {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  busy = false; photoBusy = false; error = ''; showPassword = false;
  readonly paymentMethods = DEMO_PAYMENT_METHODS;
  readonly form = new FormBuilder().nonNullable.group({
    fullName: ['', [Validators.required, Validators.pattern(/.*\S.*\S.*\S.*/)]],
    username: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9_]{3,30}$/)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(72), Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).+$/)]],
    confirmPassword: ['', Validators.required],
    profilePictureUrl: [''], paymentMethodLabel: [''],
    theme: ['dark' as UserPreferences['theme']], notificationsEnabled: [true], soundEnabled: [false],
    acceptTerms: [false, Validators.requiredTrue]
  }, { validators: c => c.get('password')?.value === c.get('confirmPassword')?.value ? null : { mismatch: true } });
  async onSubmit(): Promise<void> {
    if (this.busy || this.photoBusy) return;
    this.form.markAllAsTouched(); this.error = '';
    if (this.form.invalid) return;
    this.busy = true;
    const value = this.form.getRawValue();
    try { await this.auth.signup({ ...value, preferences: { theme: value.theme, notificationsEnabled: value.notificationsEnabled, soundEnabled: value.soundEnabled } }); this.form.reset(); await this.router.navigateByUrl('/profile'); }
    catch (e) { this.error = e instanceof Error ? e.message : 'Registration failed. Please try again.'; }
    finally { this.busy = false; }
  }
}
