# Reading List

## Run locally

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env` if `.env` does not already exist.
3. Create or update the local SQLite database with `npm run db:push`.
4. Set `AUTH_SESSION_SECRET` in `.env` to a random secret of at least 32
   characters.
5. Start the app with `npm run dev`.

## Login

The demo account is `reader` with password `readwithme`. Update the `ACCOUNTS`
map in `lib/auth.js` to add or change local accounts. Sessions use signed,
HTTP-only cookies and expire after seven days. All book APIs and detail pages
require a valid login.

This fixed-account setup is for local development and demos, not public
production deployments. Use a proper user store and password hashing before
exposing the app to the internet.

Reading titles, notes, and HTTP(S) links are stored in `dev.db`. Links are
validated before saving and open in a new browser tab.

The Prisma model and asynchronous CRUD API are in `prisma/schema.prisma` and
`app/api/books`. The schema now stores a URL instead of cover-image bytes; apply
the update with `npm run db:push`. Existing titles and descriptions are kept,
but the old image data is removed. To move to MySQL later, change the Prisma datasource provider
to `mysql`, update `DATABASE_URL`, then apply the schema with Prisma's migration
tools. The CRUD code uses Prisma and does not depend on SQLite-specific
queries.
