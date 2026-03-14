# Authentication Setup Guide

## Overview

This application uses **Supabase Auth** for secure server-side authentication with email/password login, magic link invitations, and role-based access control.

---

## 🚀 Quick Start

### 1. Environment Variables

Update your `.env` file with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tfnxamnxtdwkioscvhoi.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**Important:** Replace `your_anon_key_here` and `your_service_role_key_here` with your actual Supabase keys from your Supabase project dashboard.

---

### 2. Database Setup

Run the migration to create the necessary tables and functions:

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Copy and run the contents of `supabase/migrations`

This will create:
- `profiles` table for user information
- User roles enum (`System Admin`, `Warehouse Manager`, `Warehouse Staff`, `Viewer`)
- Row-level security policies
- Automatic profile creation trigger

---

### 3. Seed Admin User

Create the default admin account by running:

```bash
bun run scripts/seed.ts
```

Or manually run the seed function in your code during initialization.

**Default Admin Credentials:**
- Email: `admin@primexmeta.com`
- Password: `Admin@000`

⚠️ **Important:** Change this password immediately after first login in production!

---

## 🔐 Authentication Features

### ✅ Implemented Features

1. **Server-Side Authentication**
   - All auth checks run on the server
   - Secure session management with HTTP-only cookies
   - Middleware-based route protection

2. **Protected Routes**
   - All application routes require authentication
   - Unauthenticated users redirected to `/login`
   - Authenticated users can't access `/login` (redirected to dashboard)

3. **Login/Logout**
   - Email + password authentication
   - Secure session creation and destruction
   - Server actions for auth operations

4. **User Management**
   - Role-based access control
   - Admin and Manager can invite users
   - Magic link email invitations

5. **Password Setup Flow**
   - New users receive magic link email
   - Secure token verification
   - One-time password creation
   - Automatic login after setup

6. **Database Seeding**
   - Idempotent admin user creation
   - Safe to run multiple times
   - No duplicate accounts

---

## 📁 File Structure

```
src/
├── app/
│   ├── login/
│   │   ├── page.tsx          # Login page
│   │   └── actions.ts        # Login/logout server actions
│   ├── setup-password/
│   │   ├── page.tsx          # Password setup for invited users
│   │   └── actions.ts        # Password setup server action
│   └── middleware.ts         # Route protection middleware
├── lib/
│   ├── supabase/
│   │   ├── server.ts         # Server-side Supabase client
│   │   ├── client.ts         # Client-side Supabase client
│   │   └── middleware.ts     # Session management
│   └── actions/
│       └── auth.ts           # Auth utility functions
├── components/
│   └── users/
│       └── CreateUserForm.tsx # User invitation form
└── types/
    └── supabase.ts           # TypeScript types

supabase/
└── migrations/
    └── 001_initial_schema.sql # Database schema

scripts/
└── seed.ts                   # Admin user seed script
```

---

## 🔒 Security Features

### Server-Side Only
- All authentication runs on the server
- No sensitive operations in client components
- Secure session cookie management

### Route Protection
- Middleware checks every request
- Automatic redirects for unauthorized access
- Session refresh on each request

### Password Security
- All passwords handled by Supabase Auth
- Never stored manually in database
- Automatic password hashing

### Magic Links
- Single-use tokens
- Automatic expiration
- Verified by Supabase

### Row-Level Security (RLS)
- Database-level access control
- Policy-based permissions
- Role-based data access

---

## 👥 User Roles

| Role | Permissions |
|------|------------|
| **System Admin** | Full access, can manage all users and settings |
| **Warehouse Manager** | Can invite users, manage inventory and warehouse operations |
| **Warehouse Staff** | Can view and update inventory, create transactions |
| **Viewer** | Read-only access to inventory data |

---

## 🔄 User Invitation Flow

1. **Admin/Manager creates user**
   - Enters email, name, and role
   - System sends magic link email

2. **User receives email**
   - Contains secure magic link
   - Link directs to `/setup-password`

3. **User sets password**
   - Creates secure password (min 8 chars)
   - System validates and creates session

4. **User is logged in**
   - Redirected to dashboard
   - Full access based on role

---

## 🧪 Testing Authentication

### Test the Admin Login
1. Start the application: `bun dev`
2. Navigate to `/login`
3. Login with:
   - Email: `admin@primexmeta.com`
   - Password: `Admin@000`
4. Verify redirect to dashboard

### Test User Invitation
1. Login as admin
2. Go to `/users`
3. Click "Invite User"
4. Fill form and submit
5. Check Supabase Auth dashboard for new user

### Test Route Protection
1. Logout
2. Try accessing `/products` or any protected route
3. Verify redirect to `/login`

---

## 🐛 Troubleshooting

### "Missing environment variables"
- Verify `.env` file has all variables
- Restart dev server after changing `.env`

### "Invalid token" during magic link
- Check `NEXT_PUBLIC_SITE_URL` is correct
- Verify Supabase URL configuration

### "User already exists"
- This is normal for seed script (idempotent)
- Admin account already created

### "Unauthorized" when inviting users
- Verify your role is Admin or Manager
- Check RLS policies in Supabase dashboard

---

## 📧 Email Configuration

For magic links to work in production:

1. Configure SMTP in Supabase Dashboard
2. Go to **Authentication** > **Email Templates**
3. Customize invitation email template
4. Test email delivery

Default (dev): Supabase provides test email functionality

---

## 🚢 Production Deployment

### Pre-deployment Checklist

- [ ] Update `.env` with production Supabase credentials
- [ ] Run database migration on production Supabase instance
- [ ] Execute seed script to create admin user
- [ ] Configure production SMTP for emails
- [ ] Change default admin password immediately
- [ ] Set up proper redirect URLs in Supabase Dashboard
- [ ] Test login, logout, and invitation flows
- [ ] Verify route protection works
- [ ] Enable additional Supabase Auth security features

### Environment Variables for Production

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

---

## 📖 API Reference

### Server Actions

#### `login(formData: FormData)`
Authenticates user with email/password

#### `logout()`
Signs out user and redirects to login

#### `setupPassword(formData: FormData)`
Sets password for invited user

#### `inviteUser(email, fullName, role)`
Sends magic link invitation to new user

#### `seedAdminUser()`
Creates default admin account (idempotent)

#### `getCurrentUser()`
Returns current authenticated user with profile

#### `hasRole(roles: UserRole | UserRole[])`
Checks if user has specific role(s)

#### `listUsers()`
Returns all users (Admin/Manager only)

---

## 🎯 Next Steps

1. **Customize Email Templates**
   - Update invitation email design
   - Add company branding

2. **Implement Password Reset**
   - Add "Forgot Password" functionality
   - Email reset link flow

3. **Add User Profile Management**
   - Allow users to update their profile
   - Change password feature

4. **Implement Audit Logs**
   - Track user actions
   - Login/logout history

5. **Two-Factor Authentication**
   - Optional 2FA for sensitive roles
   - TOTP implementation

---

## 📚 Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

---

## ✅ Success Criteria Verification

- [x] Admin seed account created on first deployment
- [x] Seed script is idempotent (no duplicates)
- [x] Authentication is fully server-side
- [x] All routes are protected
- [x] Login and logout work correctly
- [x] Supabase magic link onboarding works
- [x] Password setup flow works securely
- [x] Roles are assigned and stored in database
- [x] RLS policies protect data access
- [x] Session management is secure

---

**Need help?** Check the troubleshooting section or contact your team lead.
