
export type UserRole = 'admin' | 'accounting' | 'student';

export interface UserPreferences {
  theme: 'dark' | 'light';
  notificationsEnabled: boolean;
  soundEnabled: boolean;
}

export interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: UserRole;
  profilePictureUrl?: string;
  preferences: UserPreferences;
  createdAt: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface SignupData {
  username: string;
  fullName: string;
  email: string;
  password: string;
  profilePictureUrl?: string;
  preferences: UserPreferences;
  paymentMethodLabel?: string;
}

export const USER_ROLES: readonly UserRole[] = [
  'admin',
  'accounting',
  'student'
];
