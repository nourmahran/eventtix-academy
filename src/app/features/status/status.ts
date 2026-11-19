import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { EventService } from '../events/services/event';
import { BookingStorage } from '../events/services/booking-storage';
@Component({ selector:'app-status',imports:[RouterLink,DecimalPipe],templateUrl:'./status.html' })
export class Status {
 private route=inject(ActivatedRoute);private catalogue=inject(EventService);private bookings=inject(BookingStorage);
 readonly title=this.route.snapshot.data['heading'];readonly message=this.route.snapshot.data['message'];
 readonly links:{path:string;label:string}[]=this.route.snapshot.data['links']??[];
 events=this.catalogue.getEvents(); sold=0; revenue=0; error='';
 constructor(){if(this.links.length){try{for(const e of this.events){this.sold+=this.bookings.reservedSeats(e.id).length;this.revenue+=this.bookings.ticketRevenue(e.id);}}catch(e){this.error=e instanceof Error?e.message:'Booking totals unavailable.';}}}
 describe(path:string):string {return ({'/accounting':'Fees, payroll and academy finances.','/admin/events':'Create events, edit pricing and details.','/student-fees':'Invoices, payment records and balances.','/payroll':'Salaries, allowances and monthly reports.','/event-finance':'Event income, expenses and sponsorships.','/department-budget':'Department income, expenses and balances.'} as Record<string,string>)[path]??'Open workspace';}
}
