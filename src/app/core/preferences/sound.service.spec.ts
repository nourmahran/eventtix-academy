import { TestBed } from '@angular/core/testing';
import { AuthService } from '../auth/auth.service';
import { SoundService } from './sound.service';
describe('Sound feedback',()=>{
 it('remains silent with sound disabled and plays when enabled',async()=>{let enabled=false;const tone={frequency:{setValueAtTime:()=>{}},connect:()=>{},start:jasmine.createSpy(),stop:()=>{},disconnect:()=>{}};const gain={gain:{setValueAtTime:()=>{},linearRampToValueAtTime:()=>{},exponentialRampToValueAtTime:()=>{}},connect:()=>{},disconnect:()=>{}};TestBed.configureTestingModule({providers:[{provide:AuthService,useValue:{user:()=>({preferences:{soundEnabled:enabled}})}}]});const s=TestBed.inject(SoundService);(s as any).context={resume:()=>Promise.resolve(),createOscillator:()=>tone,createGain:()=>gain,currentTime:0,destination:{}};await s.success();expect(tone.start).not.toHaveBeenCalled();enabled=true;await s.success();expect(tone.start).toHaveBeenCalled();});
});
