import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-photo-picker',
  template: `
    <div class="photo-picker">
      @if (value()) { <img [src]="value()" alt="Your profile picture preview" width="88" height="88" /> }
      @else { <div class="avatar" aria-hidden="true">✦</div> }
      <label>Profile picture (optional)
        <input type="file" accept="image/png,image/jpeg,image/webp" (change)="select($event)" [disabled]="busy || disabled()" />
      </label>
      <small>PNG, JPEG or WebP, up to 2 MB. Saved only in this browser.</small>
      @if (value()) { <button type="button" [disabled]="busy || disabled()" (click)="valueChange.emit('')">Remove picture</button> }
      @if (busy) { <p role="status">Preparing your picture…</p> }
      @if (error) { <p class="error" role="alert">{{ error }}</p> }
    </div>`,
  styles: `
    .photo-picker { display: grid; justify-items: start; gap: 10px; margin-bottom: 24px; }
    img, .avatar { border-radius: 50%; object-fit: cover; border: 2px solid var(--accent); }
    .avatar { width: 88px; height: 88px; display: grid; place-items: center; font-size: 36px; color: var(--accent); }
    label { display: grid; gap: 10px; font-weight: 600; width: 100%; }
    input { max-width: 100%; font-size: 13px; }
    small { line-height: 1.5; }
    button { border: 1px solid var(--border); border-radius: 6px; padding: 7px 12px; background: transparent; color: inherit; cursor: pointer; }
    .error { color: var(--error, #ff9aaf); }
  `
})
export class PhotoPicker {
  readonly value = input('');
  readonly disabled = input(false);
  readonly valueChange = output<string>();
  readonly busyChange = output<boolean>();
  busy = false;
  error = '';

  async select(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.error = '';
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > 2 * 1024 * 1024) {
      this.error = 'Choose a PNG, JPEG or WebP image no larger than 2 MB.';
      input.value = '';
      return;
    }
    this.busy = true;
    this.busyChange.emit(true);
    const url = URL.createObjectURL(file);
    try {
      const image = new Image();
      image.src = url;
      await image.decode();
      if (!image.width || !image.height || image.width > 4096 || image.height > 4096) throw new Error();
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = 192;
      const context = canvas.getContext('2d');
      if (!context) throw new Error();
      const size = Math.min(image.width, image.height);
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, 192, 192);
      context.drawImage(image, (image.width - size) / 2, (image.height - size) / 2, size, size, 0, 0, 192, 192);
      this.valueChange.emit(canvas.toDataURL('image/jpeg', 0.85));
    } catch { this.error = 'This image could not be read. Choose an image smaller than 4096 × 4096 pixels.'; }
    finally { URL.revokeObjectURL(url); this.busy = false; this.busyChange.emit(false); input.value = ''; }
  }
}
