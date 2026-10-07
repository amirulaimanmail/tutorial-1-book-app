# Reading List

## Run locally

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env` if `.env` does not already exist.
3. Set `AUTH_SESSION_SECRET` in `.env` to a random secret of at least 32
   characters.
4. Generate the Prisma client and apply the schema with `npm run db:generate`
   and `npm run db:push`.
5. Start the app with `npm run dev`.

## Login

The demo account is `reader` with password `readwithme`. Update the `ACCOUNTS`
map in `lib/auth.js` to add or change local accounts. Sessions use signed,
HTTP-only cookies and expire after seven days. All book APIs and detail pages
require a valid login.

This fixed-account setup is for local development and demos, not public
production deployments. Use a proper user store and password hashing before
exposing the app to the internet.

Reading titles, descriptions, and HTTP(S) links are stored in the local
`dev.db` SQLite database. Links are validated before saving and open in a new
browser tab.

The Prisma model and asynchronous CRUD API are in `prisma/schema.prisma` and
`app/api/books`.
