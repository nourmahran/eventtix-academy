import { TestBed } from '@angular/core/testing';
import { PhotoPicker } from './photo-picker';

describe('Profile picture picker', () => {
  it('rejects unsupported and oversized files without changing the photo', async () => {
    const picker = TestBed.createComponent(PhotoPicker).componentInstance;
    const emit = spyOn(picker.valueChange, 'emit');
    const input = document.createElement('input');
    input.type = 'file';
    for (const file of [new File(['<svg/>'], 'picture.svg', { type: 'image/svg+xml' }), new File([new Uint8Array(2100000)], 'large.png', { type: 'image/png' })]) {
      const transfer = new DataTransfer();
      transfer.items.add(file);
      input.files = transfer.files;
      await picker.select({ target: input } as unknown as Event);
      expect(picker.error).toContain('2 MB');
    }
    expect(emit).not.toHaveBeenCalled();
  });

  it('resizes a valid image into a local avatar', async () => {
    const picker = TestBed.createComponent(PhotoPicker).componentInstance;
    const emit = spyOn(picker.valueChange, 'emit');
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 16;
    const blob = await new Promise<Blob>(resolve => canvas.toBlob(value => resolve(value!), 'image/png'));
    const transfer = new DataTransfer();
    transfer.items.add(new File([blob], 'avatar.png', { type: 'image/png' }));
    const input = document.createElement('input'); input.type = 'file'; input.files = transfer.files;
    await picker.select({ target: input } as unknown as Event);
    expect(emit).toHaveBeenCalledWith(jasmine.stringMatching(/^data:image\/jpeg;base64,/));
    expect(picker.error).toBe('');
    expect(picker.busy).toBeFalse();
  });
});
