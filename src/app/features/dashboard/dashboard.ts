import { FeeLinks } from '../finance/fee-links';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { AuthService } from '../../core/auth/auth.service';
import { EventService } from '../events/services/event';
import { BookingStorage, SavedTicket } from '../events/services/booking-storage';
@Component({selector:'app-dashboard',imports:[RouterLink,DecimalPipe],templateUrl:'./dashboard.html'})
export class Dashboard {
 readonly auth=inject(AuthService); private catalogue=inject(EventService); private bookings=inject(BookingStorage);
 private feeLinks=inject(FeeLinks);
 fees: ReturnType<FeeLinks['ownFees']> = null; feeError='';
 tickets:SavedTicket[]=[]; error='';
 get events(){return this.catalogue.getEvents();}
 get spent(){return this.tickets.reduce((sum,t)=>sum+t.finalTotal,0);}
 constructor(){try{this.fees=this.feeLinks.ownFees();}catch(e){this.feeError=e instanceof Error?e.message:'Fees unavailable.';}try{this.tickets=this.bookings.tickets();}catch(e){this.error=e instanceof Error?e.message:'Tickets unavailable.';}}
}
