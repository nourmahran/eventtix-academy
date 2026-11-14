# EventTix Academy

Angular 20 standalone / SCSS frontend for Web Programming Milestone 1.

## Run locally

```sh
npm install
npm start
```

Open http://localhost:4200. Register a demo student, or select Login -> Explore demo roles to test student, accounting and admin navigation.

```sh
npm run build
npm test -- --watch=false --browsers=ChromeHeadless
```

## Current scope

Member 1 foundation/authentication is implemented: home/navigation, signup/login, profile pictures, mock cards, preferences, roles, guards, shared models and basic browser storage. Refresh signs out; registered accounts remain saved locally. Use demo information only.

Other members own events, tickets, finance, chatbot and final integration. Their route entry points currently display labeled placeholders.

See [Member 1 integration and testing notes](docs/MEMBER1-INTEGRATION.md) for the role matrix, storage keys, service API and handoff instructions.

Authentication is a browser-only classroom mock, as allowed by Milestone 1. Real authorization/payment processing require backend work in a later milestone.
