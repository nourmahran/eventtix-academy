import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { RevealDirective } from './reveal';

@Component({
  imports: [RevealDirective],
  template: '<div appReveal id="target">Hello</div>',
})
class HostComponent {}

describe('Reveal directive', () => {
  it('adds the reveal class to its element', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement.querySelector('#target') as HTMLElement;
    expect(el.classList.contains('reveal')).toBeTrue();
  });
});