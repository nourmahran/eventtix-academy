import { Injectable, inject } from '@angular/core';
import { AuthService } from '../auth/auth.service';
@Injectable({ providedIn: 'root' })
export class SoundService {
  private auth = inject(AuthService);
  private context?: AudioContext;
  async success(): Promise<void> {
    if (!this.auth.user()?.preferences.soundEnabled) return;
    try {
      this.context ??= new AudioContext();
      await this.context.resume();
      if (!this.auth.user()?.preferences.soundEnabled) return;
      const tone = this.context.createOscillator();
      const gain = this.context.createGain();
      const now = this.context.currentTime;
      tone.frequency.setValueAtTime(660, now);
      tone.frequency.setValueAtTime(880, now + .1);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(.06, now + .015);
      gain.gain.exponentialRampToValueAtTime(.001, now + .23);
      tone.connect(gain); gain.connect(this.context.destination);
      tone.onended = () => { tone.disconnect(); gain.disconnect(); };
      tone.start(now); tone.stop(now + .25);
    } catch { /* Audio is optional; a blocked device must not interrupt saving. */ }
  }
}
