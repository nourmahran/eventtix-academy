import { Injectable, inject } from '@angular/core';
import { AuthService } from '../auth/auth.service';
@Injectable({ providedIn: 'root' })
export class SoundService {
  private auth = inject(AuthService);
  private context?: AudioContext;
  /** Rising two-note chime for completed actions. */
  success(): Promise<void> { return this.play([660, 880]); }
  /** Falling two-note tone for failed actions. */
  error(): Promise<void> { return this.play([330, 220]); }

  private async play([first, second]: [number, number]): Promise<void> {
    if (!this.auth.user()?.preferences.soundEnabled) return;
    try {
      this.context ??= new AudioContext();
      await this.context.resume();
      if (!this.auth.user()?.preferences.soundEnabled) return;
      const tone = this.context.createOscillator();
      const gain = this.context.createGain();
      const now = this.context.currentTime;
      tone.frequency.setValueAtTime(first, now);
      tone.frequency.setValueAtTime(second, now + .1);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(.06, now + .015);
      gain.gain.exponentialRampToValueAtTime(.001, now + .23);
      tone.connect(gain); gain.connect(this.context.destination);
      tone.onended = () => { tone.disconnect(); gain.disconnect(); };
      tone.start(now); tone.stop(now + .25);
    } catch { /* Audio is optional; a blocked device must not interrupt saving. */ }
  }
}
