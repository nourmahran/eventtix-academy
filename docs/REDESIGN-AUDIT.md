# EventTix design audit
Baseline: 759a971, clean develop. Branch: feature/premium-ui-redesign.
Inspected rendered home, login, signup, profile, catalogue/detail, seats, checkout, ticket history, admin/accounting, events management, fees, payroll, event finance, departments and forbidden screens. Inspected the working chatbot and sound code.
Findings: competing theme blocks, repeated CSS, inconsistent widths, tall centered forms, dashboard link lists, bright chart panels, floating chat covering actions, weak seat contrast, unlabeled inputs, no featured events/footer/student overview.
Direction: Observatory. Restrained navy, teal, warm ivory light mode, fine borders, Segoe UI/system sans typography, editorial event imagery. No font download or runtime dependency. Existing service contracts retained. Student fees lack account mapping: show an explicit unavailable state, never staff-wide private records.
Acceptance: preserve workflows and both bonuses; build/tests; mobile and desktop checks at 320/375/390/768/1024/1440/1920; accessible controls and reduced motion.
