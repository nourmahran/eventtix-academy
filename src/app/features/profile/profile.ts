import { DEMO_PAYMENT_METHODS } from '../../core/auth/profile-options';
import { PhotoPicker } from '../../shared/photo-picker/photo-picker';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/auth/auth.service';
@Component({ selector: 'app-profile', imports: [ReactiveFormsModule, PhotoPicker], templateUrl: './profile.html', styleUrl: './profile.scss' })
export class Profile {
  readonly auth = inject(AuthService);
  message = ''; error = ''; photoBusy = false;
  readonly paymentMethods = DEMO_PAYMENT_METHODS;
  readonly form = new FormBuilder().nonNullable.group({
    fullName: [this.auth.user()?.fullName ?? '', [Validators.required, Validators.minLength(3)]],
    email: [this.auth.user()?.email ?? '', [Validators.required, Validators.email]],
    profilePictureUrl: [this.auth.user()?.profilePictureUrl ?? ''],
    paymentMethodLabel: [this.auth.user()?.paymentMethodLabel ?? ''],
    theme: [this.auth.user()?.preferences?.theme ?? 'dark'],
    notificationsEnabled: [this.auth.user()?.preferences?.notificationsEnabled ?? true],
    soundEnabled: [this.auth.user()?.preferences?.soundEnabled ?? false]
  });
  save(): void {
    if (this.photoBusy) return;
    this.message = ''; this.error = ''; this.form.markAllAsTouched();
    if (this.form.invalid) return;
    const value = this.form.getRawValue();
    try { this.auth.updateProfile(value.fullName, value.email, { theme: value.theme, notificationsEnabled: value.notificationsEnabled, soundEnabled: value.soundEnabled }, { profilePictureUrl: value.profilePictureUrl, paymentMethodLabel: value.paymentMethodLabel }); this.form.markAsPristine(); this.message = 'Profile saved.'; }
    catch (e) { this.error = e instanceof Error ? e.message : 'Unable to save profile.'; }
  }
}
