import { TestBed } from '@angular/core/testing';
import { DepartmentBudget } from './department-budget';
import { SoundService } from '../../../core/preferences/sound.service';
describe('Department budgets',()=>{
 beforeEach(()=>{localStorage.removeItem('eventtix.departments.v1');TestBed.configureTestingModule({providers:[{provide:SoundService,useValue:{success:()=>Promise.resolve()}}]});});
 afterEach(()=>localStorage.removeItem('eventtix.departments.v1'));
 const create=()=>TestBed.runInInjectionContext(()=>new DepartmentBudget());
 it('persists department income and expenses with correct balances',()=>{const c=create();c.name='Teaching';c.addDepartment();c.description='Tuition';c.amount=1000;c.addTransaction();c.type='expense';c.description='Materials';c.amount=250;c.addTransaction();const restored=create();expect(restored.total(restored.departments[0],'income')-restored.total(restored.departments[0],'expense')).toBe(750);});
 it('rejects negative values, duplicate departments and stale writes',()=>{const c=create();c.name='Teaching';c.addDepartment();c.name='teaching';c.addDepartment();expect(c.departments.length).toBe(1);c.amount=-5;c.description='Bad';c.addTransaction();expect(c.departments[0].transactions.length).toBe(0);const stale=create();c.name='Arts';c.addDepartment();stale.name='Science';stale.addDepartment();expect(stale.error).toContain('another tab');expect(create().departments.length).toBe(2);});
});
