# NT TECH INNOVATION — Coming Soon Landing Page

A clean, responsive "Coming Soon" page for **NT TECH INNOVATION** (Next.js + Tailwind + framer-motion).  
Includes waitlist capture via **/api/waitlist** to an SQL database (Prisma).

## Quickstart (Next.js 14+ App Router)

```bash
# 1) Create a Next.js app (if you don't have one yet)
npx create-next-app@latest nt-coming-soon
cd nt-coming-soon

# 2) Install deps
npm i framer-motion lucide-react
npm i -D prisma
npm i @prisma/client

# 3) Copy files from this zip into your project:
#    - app/page.tsx  -> overwrite your default page
#    - app/api/waitlist/route.ts
#    - prisma/schema.prisma

# 4) Prisma setup
npx prisma init
# Edit .env
echo 'DATABASE_URL="file:./dev.db"' >> .env
# Migrate
npx prisma migrate dev --name init && npx prisma generate

# 5) Dev
npm run dev
```

### Switch to Postgres / MySQL
Update `prisma/schema.prisma` datasource:
```prisma
datasource db {
  provider = "postgresql"  // or "mysql"
  url      = env("DATABASE_URL")
}
```
Set your `DATABASE_URL` accordingly and re-run `npx prisma migrate dev`.

### Notes
- In local previews without an API route, the form falls back to saving emails in `localStorage` so you can test the flow.
- Social links show only if populated in the `BRAND.socials` object in `app/page.tsx`.
- Tailwind required; if you don't use it, replace the classes or minimal styles.
