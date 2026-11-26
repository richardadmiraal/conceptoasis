# Private reports (conceptoasis.com/admiraal/reports/)

Sign-in page for client reports: web version and PDF, both kept in private Supabase storage, never in this repo.

- Clients sign in with email + password, or an emailed sign-in link. First visit asks for their name, an optional password, and an opt-in tick box for a free recomemo page.
- They see only reports shared with their email. They can share a report by adding email addresses (for example their mortgage broker).
- Richard (admin, listed in `public.admins`) sees an "Add a report" form: title, property, prepared for, date, client emails, and the files (index.html, images, PDF). The private link is shown after upload.
- Links inside a report open in a new tab.

Setup: run `supabase/schema.sql` in the Supabase SQL editor, then put the Project URL and anon key in `config.js`.
The same Supabase project can carry File XO and recomemo sign-ins later (one co|co account).
