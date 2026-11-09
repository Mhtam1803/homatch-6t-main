# Phone sign-in setup

1. Copy `.env.example` to `.env.local` and set the Supabase project URL and anon key.
2. In Supabase, enable Phone as an authentication provider and configure an SMS provider and message template.
3. Add or invite phone users in Supabase Auth. This sign-in form only authenticates existing users; it does not register new accounts.
4. For password sign-in, set a password for the user's phone account in Supabase Auth.
5. Restart the Next.js development server after changing `.env.local`.

The SMS verification-code flow and phone/password flow both use Supabase Auth. Favorite homes are currently saved in the browser's local storage, so they do not sync across browsers or devices.
