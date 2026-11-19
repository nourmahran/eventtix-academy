import { UserPreferences } from '../models/user.model';

export const DEMO_PAYMENT_METHODS = ['Demo Visa •••• 4242', 'Demo Mastercard •••• 4444'] as const;

export function validateProfileOptions(preferences: UserPreferences, picture = '', paymentMethod = ''): void {
  if (!preferences || !['dark', 'light'].includes(preferences.theme) || typeof preferences.notificationsEnabled !== 'boolean' || typeof preferences.soundEnabled !== 'boolean') {
    throw new Error('Choose valid profile preferences.');
  }
  if (picture && (picture.length > 180000 || !/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(picture))) {
    throw new Error('Choose a valid PNG, JPEG or WebP profile picture.');
  }
  if (paymentMethod && !DEMO_PAYMENT_METHODS.some(method => method === paymentMethod)) {
    throw new Error('Choose one of the sample cards. Real card details are not accepted.');
  }
}
