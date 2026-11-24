import { BookingStorage, SavedTicket } from '../events/services/booking-storage';
import { Router, RouterLink } from '@angular/router';
import { SoundService } from '../../core/preferences/sound.service';
import { DEMO_PAYMENT_METHODS } from '../../core/auth/profile-options';
import { PhotoPicker } from '../../shared/photo-picker/photo-picker';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/auth/auth.service';
@Component({ selector: 'app-profile', imports: [ReactiveFormsModule, PhotoPicker, RouterLink], templateUrl: './profile.html', styleUrl: './profile.scss' })
export class Profile {
  tickets: SavedTicket[] = [];
  ticketsError = '';
  constructor() {
    try { this.tickets = inject(BookingStorage).tickets(); }
    catch(e) { this.ticketsError = e instanceof Error ? e.message : 'Tickets could not be loaded.'; }
  }
  private readonly sound = inject(SoundService);
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  busy = false;
  deletePassword = '';
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
  async save(): Promise<void> {
    if (this.photoBusy || this.busy) return;
    this.message = ''; this.error = ''; this.form.markAllAsTouched();
    if (this.form.invalid) return;
    const value = this.form.getRawValue();
    this.busy = true;
    try { await this.auth.updateProfile(value.fullName, value.email, { theme: value.theme, notificationsEnabled: value.notificationsEnabled, soundEnabled: value.soundEnabled }, { profilePictureUrl: value.profilePictureUrl, paymentMethodLabel: value.paymentMethodLabel }); this.form.markAsPristine(); this.message = 'Profile saved.'; void this.sound.success(); }
    catch (e) { this.error = e instanceof Error ? e.message : 'Unable to save profile.'; void this.sound.error(); }
    finally { this.busy = false; }
  }

  async subscribe(): Promise<void> {
    if (this.busy) return;
    this.busy = true;
    this.error = '';
    this.message = '';
    try {
      await this.auth.subscribeToEventUpdates();
      this.message = 'Subscribed to event updates. A confirmation email has been queued.';
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Unable to subscribe.';
    } finally {
      this.busy = false;
    }
  }

  async deleteAccount(): Promise<void> {
    if (this.busy || !this.deletePassword || !confirm('Delete your EventTix account?')) return;
    this.busy = true;
    this.error = '';
    this.message = '';
    try {
      await this.auth.deleteProfile(this.deletePassword);
      await this.router.navigateByUrl('/login');
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Unable to delete the account.';
    } finally {
      this.deletePassword = '';
      this.busy = false;
    }
  }
}
