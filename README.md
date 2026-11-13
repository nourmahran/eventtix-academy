# EventTix Academy

EasyWeb | GIU Web Programming — ICS 511 | Topic 15

EventTix Academy is a web application designed to help an academy manage events, ticket sales, student course fees, staff payroll, and event finances.

The platform brings together event discovery, student discounts, digital tickets, and administrative management in one application.

Project Overview

EventTix Academy supports three main event categories:

* Conferences
* Concerts
* Workshops

The application is designed for different user roles, including students, administrators, and accounting staff.

Main Features

1. User Management

* User registration and login
* User profiles
* Role-based access control
* Protected routes

2. Event Management

* Browse available events
* View event information
* Manage event details
* Manage ticket prices and available seats

3. Ticket Management

* Purchase event tickets
* Apply student discounts
* View ticket purchase history
* Generate digital tickets with QR codes
* View ticket invoices

4. Student Course Fees

* View course fees
* Track payments
* Monitor outstanding balances

5. Staff Payroll

* Manage event staff information
* Assign event-based allowances
* Track payroll payments

6. Financial Management

* Track ticket revenue
* Manage sponsorship income
* Record event expenses
* Calculate event profit
* Display financial charts

7. Additional Features

* Responsive user interface
* Animations and visual effects
* AI chatbot
* Browser storage integration

Note: These are the planned project features. Implementation and testing status should be verified before final submission.

Technologies

* Angular 20
* TypeScript
* HTML
* SCSS
* Angular Router
* Angular Reactive Forms
* Git and GitHub

Project Structure

src/
  app/
    core/
      auth/
      guards/
      models/
      services/
      storage/
    features/
      auth/
      home/
      profile/
      events/
      tickets/
      payroll/
      student-fees/
      budgets/
      chatbot/
    layout/
    shared/
      ui/
  styles.scss

Some directories may be populated as development progresses.

Installation

Prerequisites

* Node.js
* npm
* Angular CLI

Clone the repository

git clone https://github.com/nourmahran/eventtix-academy.git
cd eventtix-academy

The repository is private, so collaborators must have access.

Install dependencies

npm install

Start the development server

ng serve

Open:

http://localhost:4200/

Build

To create a production build:

ng build

Testing

To run the configured Angular unit tests:

ng test

Team — EasyWeb

Member	Responsibilities
Member 1	Project foundation, home page, authentication, profiles, routing, and access control
Member 2	Ticket purchases, QR tickets, invoices, student fees, and staff payroll
Member 3	Event management, budgets, financial charts, responsive styling, and animations
Member 4	AI chatbot, browser storage, quality assurance, and documentation

GitHub Workflow

The project uses Git branches for collaborative development.

* main — Stable project version
* develop — Shared development and integration branch
* feature/member1-foundation-auth
* feature/member2-payroll-fees
* feature/member3-budget-ui
* feature/member4-chatbot-storage-qa

Feature branches are merged into develop through pull requests after review.

Academic Information

University: German International University (GIU)

Course: ICS 511 — Web Programming

Team: EasyWeb

Project Topic: 15 — EventTix: Academy Events and Ticket Store

Milestone: 1

Project Status

Under development. Features, bonuses, and tests will be verified before the final submission.

⸻

Developed by Team EasyWeb for GIU Web Programming.
