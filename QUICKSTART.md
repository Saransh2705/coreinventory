# 🚀 Quick Start Guide

## Prerequisites

- Bun installed
- Supabase project created
- Environment variables configured

## Setup Steps

### 1. Install Dependencies

```bash
bun install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and update with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3. Setup Database

1. Go to Supabase SQL Editor
2. Run the migration from `supabase/migrations/001_initial_schema.sql`

### 4. Seed Admin User

```bash
bun run seed
```

This creates the default admin account:
- **Email:** admin@primexmeta.com
- **Password:** Admin@000

### 5. Start Development Server

```bash
bun dev
```

Open [http://localhost:3000/login](http://localhost:3000/login)

### 6. Login

Use the admin credentials to login and start using the application.

---

## What's Next?

- Change admin password
- Invite team members from `/users`
- Configure email templates in Supabase
- Customize the application

---

## Troubleshooting

**Can't login?**
- Verify database migration was successful
- Check seed script ran without errors
- Confirm environment variables are correct

**Magic links not working?**
- Check `NEXT_PUBLIC_SITE_URL` matches your domain
- Verify Supabase auth redirect URLs

**Need more help?**
- See `docs/AUTHENTICATION_SETUP.md` for detailed documentation
- Check Supabase logs for authentication errors

---

## Key Files

- `src/middleware.ts` - Route protection
- `src/app/login/page.tsx` - Login page
- `src/lib/supabase/server.ts` - Server client
- `src/lib/actions/auth.ts` - Auth utilities

---

## Available Scripts

- `bun dev` - Start development server
- `bun build` - Build for production
- `bun start` - Start production server
- `bun seed` - Seed admin user
- `bun lint` - Run ESLint

---

## Authentication Flow

```
User → /login → Enter credentials → Server validates → Create session → Redirect to dashboard
                                   ↓
                                 Invalid
                                   ↓
                              Show error
```

## Invitation Flow

```
Admin → Invite user → Supabase sends magic link → User clicks link → Setup password → Auto login → Dashboard
```

---

**🎉 You're all set!** Start building your inventory management system.
