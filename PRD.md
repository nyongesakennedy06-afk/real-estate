# Product Requirements Document

## Kiragu & Mwangi Real Estate Management System

**Version:** 1.0
**Prepared for:** Antigravity AI agent, building on Supabase (via the Supabase MCP)
**Status:** Ready for phased build
**Time budget:** about 60 minutes in total. Phases 1–7 are the core build. Phases 8–9 are done only if time remains.

---

## 1. Vision & Positioning

We are building a web-based information system for **Kiragu & Mwangi Ltd**, a Nairobi real estate **valuation and property management** firm. It has two parts that share one database:

1. **A public site** where visitors browse and search residential and commercial listings. Registered users can **book site viewings** (the main transaction) and **request property valuations**.
2. **An admin panel** where staff manage listings, viewing bookings, valuation requests and users, generate branded reports, and review an audit trail of every action.

The product should feel **trustworthy, calm, and professional**, like an established Nairobi firm rather than a flashy listings portal. Generous whitespace, restrained color, clear hierarchy, and plain language.

The system must work **well on desktop, tablet and mobile**. This is a requirement in every phase, not a final polish step. Check each page at roughly 1280px, 768px and 390px widths before ending a phase.

**This PRD is the source of truth.** Where it differs from the earlier class diagram, it follows the Database Schema Specification (see Section 6.8 for the list of deliberate differences).

---

## 2. Technology Stack & Environment

### 2.1 Stack (fixed. Do not substitute.)

| Layer | Choice |
| --- | --- |
| Frontend | React + Vite + TypeScript, **a single app** that holds both the public site and the admin panel (`/admin/*` routes) |
| Styling / UI | Tailwind CSS + shadcn/ui (follow shadcn's current Vite install guide) |
| Icons | `lucide-react` (thin-line) |
| Routing | React Router |
| Data fetching | TanStack Query + `@supabase/supabase-js` |
| Forms / validation | `react-hook-form` + `zod` |
| Dates | `date-fns` |
| Toasts | `sonner` |
| Reports | `jspdf` + `jspdf-autotable` (PDF), plain CSV generation (no extra dependency needed) |
| Backend | **Supabase only**: Postgres, Auth, Storage, Realtime. There is **no custom Express server** |

### 2.2 Dev server port

The app **must run on port 5175**.

- `vite.config.ts`: `server: { port: 5175, strictPort: true }` and the same for `preview`.
- `package.json`: `"dev": "vite --port 5175 --strictPort"`.
- `strictPort` is required so the agent fails loudly if the port is taken instead of silently moving to another port.
- Local URL: `http://localhost:5175`.

### 2.3 Supabase via MCP

- Use the **Supabase MCP** for all database work: apply schema changes as **named migrations**, not ad-hoc edits, so the schema is reproducible.
- Get the project URL and anon key through the MCP and write them to `.env.local` as `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- **Never** put the `service_role` key in the frontend or in any committed file. Add `.env.local` to `.gitignore`.
- After the schema and RLS phase, generate TypeScript types through the MCP and commit them (e.g. `src/lib/database.types.ts`).
- After the schema phase, run the MCP **security advisor check** and fix any warnings about missing RLS or exposed functions.
- **Manual step for the owner (the agent cannot do this):** in Supabase Auth settings, set **Site URL** to `http://localhost:5175` and add `http://localhost:5175/reset-password` to the redirect URLs. For development, turn **"Confirm email" off** so sign-ups work immediately. Remind the owner at the start of Phase 3.

### 2.4 Suggested project structure

```
src/
  components/   (ui/ for shadcn, layout/, property/, admin/)
  pages/        (public pages, account pages, admin pages)
  lib/          (supabase client, formatters, report builders, database.types.ts)
  hooks/        (useAuth, useProperties, etc.)
  routes/       (route guards: RequireAuth, RequireAdmin)
```

---

## 3. Design Language (applies to every page, every phase)

No brand assets exist yet, so this PRD defines a **placeholder identity**. All colors and fonts are set as design tokens in one place (Tailwind theme and CSS variables) so a real brand can replace them in minutes.

### 3.1 Color Palette. Deep Green & Brass

| Token | Hex | Use |
| --- | --- | --- |
| `primary` | `#14342B` | Header and footer backgrounds, primary buttons, headings |
| `background` | `#F8F6F0` | Page background (warm ivory) |
| `surface` | `#FDFCF9` | Cards, forms, panels |
| `accent` | `#B8893B` | Brass accent for key CTAs, active states, price highlights. Use sparingly |
| `ink` | `#1C2321` | Body text |
| `muted` | `#6B726E` | Secondary text and captions |
| `border` | `#E3E0D6` | Hairline borders and dividers |

Status colors (badges): pending/submitted = amber, confirmed/completed = green, rescheduled/under review = blue, closed = grey, error = red. Keep them muted, never neon.

Avoid pure black and pure white. Always use the warm-tinted tokens.

### 3.2 Typography

- **Headings:** Fraunces (serif), regular/medium weight.
- **Body and UI:** Plus Jakarta Sans.
- Load both through Google Fonts with sensible fallbacks (`Georgia, serif` and `system-ui, sans-serif`).
- Small uppercase tracked-out eyebrow labels (e.g. "FEATURED LISTINGS") above section headings.
- No more than three font sizes within any one section.

### 3.3 Placeholder Logo

- Draw an **inline SVG monogram**: a rounded square in `primary` containing a minimal roofline glyph and the letters "K&M" in brass.
- Wordmark beside it: **Kiragu & Mwangi** in Fraunces, with a small tracked line underneath: `REAL ESTATE · VALUATION`.
- Keep the logo in a single component (`<Logo />`) and as a standalone `public/logo.svg` so the reports (Phase 8) can reuse it.

### 3.4 Imagery

- Use royalty-free property photos (e.g. Unsplash URLs) for seed data. Prefer bright, clean exterior and interior shots. Keep a **consistent aspect ratio** (16:10 on cards, 3:2 on detail) using `object-fit: cover`.
- Every image needs meaningful `alt` text and `loading="lazy"` (except the first visible one).

### 3.5 Layout & Components

- Max content width about 1200px, centered, with comfortable gutters.
- Cards: hairline border, small radius (6–8px), generous padding, soft hover shadow.
- Buttons: solid `primary` for main actions, `accent` for the single most important CTA on a page, outlined for secondary. Understated hover states.
- Forms: clear labels, inline validation messages, visible focus rings, helpful error text.
- Motion: subtle only (fades and hover transitions).

### 3.6 Responsive Behavior (applies everywhere)

- **Desktop:** multi-column grids (3 columns for listings), full nav bar, admin sidebar visible.
- **Tablet:** listings in 2 columns, filters in a collapsible panel, admin sidebar collapsible.
- **Mobile:** single column, hamburger nav, filters in a slide-over sheet, touch targets at least 44px, admin sidebar becomes a drawer, data tables become stacked cards or scroll horizontally inside their own container (the page itself must never scroll sideways).

---

## 4. Users & Roles

There are two roles, stored in `profiles.role`: **`user`** and **`admin`**. Visitors (not signed in) are not a role. They are simply unauthenticated.

| Actor | Can do |
| --- | --- |
| **Visitor** (not signed in) | Browse and search listings, view property details, register, log in, reset a forgotten password |
| **User** (`user`) | Everything a visitor can, plus: book site viewings, submit valuation requests, view and edit their own profile, view their own bookings and valuation requests |
| **Admin** (`admin`) | **All privileges.** Everything a user can do, plus the full admin panel: manage listings and images, manage all viewing bookings, manage all valuation requests, manage users and roles, generate reports, view audit logs |

Rules:

- Every new sign-up becomes a `user` automatically. **Role is never taken from client-supplied data** (including sign-up metadata).
- The **first admin** is created by promoting an existing account through SQL (Phase 3). After that, admins can promote or demote other users from the admin panel.
- An admin cannot demote or deactivate **themselves**, and the last remaining admin cannot be demoted. This prevents lockout.
- Deactivated users (`is_active = false`) are signed out and cannot sign in or write data.
- Role enforcement happens in **Row Level Security on the database**, not only in the UI. Hiding a button is never the only protection.

---

## 5. Pages & Features

### 5.1 Global Elements

**Header** (all pages): logo (left), nav (Home, Listings, Request Valuation), and on the right either **Log in / Register** (guest) or an **account menu** (user: My Bookings, My Valuations, Profile, Log out. Admin: the same plus **Admin Panel**). Mobile: hamburger opening a slide-in panel.

**Footer:** primary background with ivory text. Logo, short tagline, quick links, contact summary (placeholder: Westlands, Nairobi; placeholder phone and email), copyright row. **No WhatsApp elements anywhere** (see Section 7).

### 5.2 Home Page `/`

1. **Hero:** headline (e.g. "Property, valued and managed with care"), one supporting line, primary CTA "Browse Properties", secondary CTA "Request a Valuation".
2. **Quick search bar:** listing type (Buy / Rent), category (Residential / Commercial), location text, max price. Submitting goes to `/properties` with the filters in the URL query string.
3. **Featured listings:** 3–6 property cards (`is_featured = true`, `status = available`).
4. **Our services:** three minimal cards: Property Listings, Site Viewings, Valuation Services (thin-line icon, heading, one line).
5. **Trust strip:** placeholder stats row (e.g. "25+ years in Nairobi", "Hundreds of properties managed", "Licensed valuers"). Clearly placeholder copy.
6. **Closing CTA banner** before the footer.

### 5.3 Listings Page `/properties` (FR3: browse and search)

- Responsive grid of property cards. Each card: primary image, title, location, price (formatted KES, with "/month" for rentals), bedrooms/bathrooms/size where present, and badges for **For Sale / For Rent** and **Residential / Commercial**.
- **Filters** (combined with AND): listing type, category, location (case-insensitive partial match), price range (min/max), and optionally bedrooms. Filters **read from and write to URL query parameters**, so links are shareable and the Home quick search works.
- **Sorting:** newest first, price low to high, price high to low.
- **Pagination** at 9 or 12 per page, handled server-side.
- Only `status = 'available'` properties are shown to the public (admins see everything in the admin panel).
- **Empty state:** "No properties match your filters" with a "Clear filters" action. **Loading state:** skeleton cards.
- The whole card links to the property detail page.

### 5.4 Property Detail `/properties/:id`

- **Image gallery:** large primary image with a thumbnail strip, swipeable on mobile. Falls back gracefully if a property has no images.
- **Details panel:** title, location, price (prominent), listing type and category badges, status, bedrooms, bathrooms, size (sq ft), full description.
- **Actions:**
  - **"Book a Site Viewing"** opens the booking form (see 5.6). If the visitor is not signed in, send them to log in, then **return them to this property** afterwards.
  - **"Request a Valuation"** links to `/valuation/new`.
- If the property is no longer `available`, show its status and disable booking.

### 5.5 Authentication (FR1)

Pages: `/login`, `/register`, `/forgot-password`, `/reset-password`.

- **Register:** full name, email, phone number, password (minimum 8 characters), confirm password. Creates a Supabase Auth user, and a `profiles` row is created automatically by a database trigger with `role = 'user'`.
- **Login / Logout:** email and password. Clear error messages ("Incorrect email or password"). After login, return to the page the user came from (or the admin panel for admins who log in directly).
- **Forgot password:** enter email, Supabase sends a reset link. Always show a neutral message ("If that email exists, a reset link has been sent") so accounts cannot be probed.
- **Reset password:** reached from the email link. Set a new password, then redirect to login.
- **Route guards:** `RequireAuth` (user or admin) and `RequireAdmin` (admin only). Non-admins who open `/admin/*` are redirected away. Unauthenticated users are sent to `/login` with a return path.
- Session persists across refreshes.

### 5.6 Site Viewing Booking. The Main Transaction (FR4)

**Client side**

- Form on the property detail page (modal or panel): **preferred date**, **preferred time**, optional **notes** (`client_notes`).
- **Slot validity and availability rules.** A booking is rejected with a clear message unless all of these hold:
  - The property is `available`.
  - The date is **today or later** (and for today, the time has not passed). Optionally cap at 60 days ahead.
  - The day is **Monday–Saturday**, and the time is between **09:00 and 17:00** in **30-minute steps**.
  - No other **active** booking (status `pending`, `confirmed` or `rescheduled`) exists for the **same property, date and time**.
- These rules are enforced **in the database** (a check or trigger plus a partial unique index) and also pre-validated in the UI (disable taken slots where practical).
- On success, the booking is saved with status **`pending`**, an audit entry is written automatically, and the user sees a confirmation.
- **My Bookings** page `/account/bookings`: the user's bookings with property, date, time, status and any admin notes (read-only).

**Admin side** (Phase 7): the admin sees new bookings in the panel. **Confirm**, **reschedule** (pick a new valid date and time) or **close** each booking, optionally adding `admin_notes`.

**Booking status lifecycle:** `pending` → `confirmed` | `rescheduled` | `closed`. A `rescheduled` booking can later be `confirmed` or `closed`.

**Dashboard alert:** pending bookings (and submitted valuations) are shown as **count badges** on the admin sidebar and overview. When the admin panel is open, a **Supabase Realtime** subscription on `viewing_bookings` inserts shows a toast ("New viewing request") and updates the badge. (WhatsApp notification is deferred. See Section 7.)

### 5.7 Valuation Requests (FR5)

**Client side**

- `/valuation/new` (login required). Fields: **property category** (residential / commercial), **location**, **LR number** (optional), **approximate size** (free text, e.g. "50 x 100 ft" or "0.25 acre"), **purpose** (sale, purchase, mortgage, insurance, rental, other), **additional details**.
- On submit: saved with status **`submitted`**, an audit entry is written automatically, and the user sees a confirmation.
- **My Valuations** page `/account/valuations`: the user's requests with status.

**Admin side** (Phase 7): list all requests, open one, and update the status **`submitted` → `under_review` → `completed`**. The admin who first changes the status is recorded in `handled_by`.

### 5.8 Account Pages

- `/account/profile`: edit full name and phone number. Email is shown read-only. Users **cannot** change their own role.
- `/account/bookings` and `/account/valuations` as described above.

### 5.9 Admin Panel `/admin` (admin only)

Layout: left sidebar (collapsible on tablet, drawer on mobile) with the logo and links. The sidebar shows count badges for pending items.

1. **Overview `/admin`:** stat cards (total listings, available listings, pending bookings, submitted valuations, total users) and short "latest pending bookings" and "latest valuation requests" lists. This is the dashboard alert area.
2. **Listings `/admin/listings` (FR2):** table of **all** properties (any status) with search and status filter. **Add, edit, delete** (delete asks for confirmation). The form covers every column in Section 6.2, plus a **multi-image uploader** (Supabase Storage bucket `property-images`) with the ability to **set a primary image** and delete images. Deleting a property removes its images.
3. **Bookings `/admin/bookings`:** all bookings with filters (status, date range). Row actions: confirm, reschedule, close, add admin notes. Show the user's name, phone and email, and the property.
4. **Valuations `/admin/valuations`:** all requests with status filter. Open a request to see full details and update its status.
5. **Users `/admin/users`:** list of users with search. Change role (`user` ↔ `admin`) and activate/deactivate, subject to the lockout rules in Section 4.
6. **Reports `/admin/reports` (Phase 8):** generate **branded PDF or CSV** reports:
   - **Bookings report**: filter by date range and status.
   - **Valuations report**: filter by date range (and status).
   - **Listings report**: filter by category.
   - PDFs carry the **company name and logo** in the header, the filters used, the generation date, and the admin's name. Generating a report writes an audit entry.
7. **Audit Logs `/admin/audit-logs` (Phase 8):** read-only, newest first, with filters (user, entity, action, date range) and pagination. Shows time, user name, action, entity, entity id, and expandable details.

All admin actions are **direct database writes** and show up immediately on the public site (no publish step).

---

## 6. Database Design (Supabase / Postgres)

Source: the Deliverable 2 Database Schema Specification, translated to Postgres. Conventions: primary keys are `uuid` named `id` (default `gen_random_uuid()`), timestamps are `timestamptz`, and every table has RLS **enabled**. Use `text` with `CHECK` constraints for the enumerated values below.

### 6.1 `profiles` (replaces `users`; extends `auth.users`)

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid, PK | FK → `auth.users(id)` on delete cascade |
| full_name | text | not null |
| email | text | copy of the auth email, for admin lists and reports |
| phone_number | text | nullable |
| role | text | `user` (default) or `admin`, CHECK constraint |
| is_active | boolean | default true |
| created_at | timestamptz | default now() |
| updated_at | timestamptz | default now() |

Password hash and reset tokens are handled by Supabase Auth, so `password_hash`, `reset_token` and `reset_token_expiry` are **not** stored.

### 6.2 `properties`

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid, PK | |
| title | text | not null |
| description | text | |
| category | text | `residential` or `commercial` |
| listing_type | text | `sale` or `rent` |
| location | text | e.g. "Kilimani, Nairobi" |
| price | numeric(15,2) | KES. For rentals, price per month |
| bedrooms | int | nullable (commercial, land) |
| bathrooms | int | nullable |
| size_sqft | numeric(10,2) | nullable |
| status | text | `available` (default), `reserved`, `sold`, `rented` |
| is_featured | boolean | default false. **Addition** for the Home page |
| created_by | uuid | FK → profiles(id) |
| created_at | timestamptz | default now() |
| updated_at | timestamptz | default now() |

Indexes: `status`, `category`, `listing_type`, `price`, and a trigram or lower-case index on `location` (to support the 3-second listing page target).

### 6.3 `property_images`

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid, PK | |
| property_id | uuid | FK → properties(id) **on delete cascade** |
| image_url | text | public URL used by the UI |
| storage_path | text | nullable. Path in the `property-images` bucket (null for external seed images). **Addition**, needed to delete files |
| is_primary | boolean | default false. Partial unique index: at most one primary per property |
| uploaded_at | timestamptz | default now() |

A property should have at least one image in normal use (the "1..*" in the class diagram), enforced in the admin form, not by the database.

### 6.4 `viewing_bookings`

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid, PK | |
| property_id | uuid | FK → properties(id) |
| user_id | uuid | FK → profiles(id) |
| viewing_date | date | not null |
| viewing_time | time | not null |
| status | text | `pending` (default), `confirmed`, `rescheduled`, `closed` |
| client_notes | text | nullable |
| admin_notes | text | nullable |
| created_at | timestamptz | default now() |
| updated_at | timestamptz | default now() |

- **Partial unique index** on `(property_id, viewing_date, viewing_time)` where `status IN ('pending','confirmed','rescheduled')`. This is the double-booking guard.
- A trigger (or check function) validates the slot rules from Section 5.6 on insert and on date/time changes.
- `whatsapp_sent` is **intentionally omitted** (WhatsApp is deferred).

### 6.5 `valuation_requests`

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid, PK | |
| user_id | uuid | FK → profiles(id) |
| property_category | text | `residential` or `commercial` |
| location | text | not null |
| lr_number | text | nullable |
| approximate_size | text | free text |
| purpose | text | `sale`, `purchase`, `mortgage`, `insurance`, `rental`, `other` |
| additional_details | text | nullable |
| status | text | `submitted` (default), `under_review`, `completed` |
| handled_by | uuid | nullable, FK → profiles(id) |
| created_at | timestamptz | default now() |
| updated_at | timestamptz | default now() |

### 6.6 `audit_logs`

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid, PK | |
| user_id | uuid | nullable, FK → profiles(id) **on delete set null** (null for changes made directly in SQL) |
| action | text | e.g. `INSERT`, `UPDATE`, `DELETE`, or `REPORT_GENERATED` |
| entity_name | text | table name, e.g. `viewing_bookings` |
| entity_id | uuid | the affected row |
| details | jsonb | changed fields (old and new values, status changes), or report filters |
| ip_address | text | best-effort from the request headers, nullable |
| created_at | timestamptz | default now() |

**How entries are written:** a generic `SECURITY DEFINER` trigger function attached to `properties`, `property_images`, `viewing_bookings`, `valuation_requests` and `profiles` records every insert, update and delete, using `auth.uid()` for `user_id`. Report generation calls an admin-only RPC (e.g. `record_audit(action, entity_name, entity_id, details)`). **No client can write to `audit_logs` directly, and nobody can edit or delete entries.**

### 6.7 Storage, Triggers, Helpers

- **Storage bucket `property-images`:** public read. Only admins can upload or delete.
- **Trigger on `auth.users` insert:** creates the `profiles` row with `role = 'user'`, copying `full_name` and `phone_number` from sign-up metadata and the email. It must **ignore any role in metadata**.
- **Trigger on `profiles` update:** blocks changes to `role` and `is_active` unless the caller is an admin, and enforces the lockout rules from Section 4.
- **Helper `is_admin()`:** `SECURITY DEFINER`, `STABLE`, returns true when the calling user's active profile has `role = 'admin'`. Used by every policy to avoid recursive RLS on `profiles`.
- **`updated_at` trigger** on all tables that have the column.

### 6.8 Row Level Security

| Table | Public / anon | Signed-in user | Admin |
| --- | --- | --- | --- |
| `properties` | SELECT where `status = 'available'` | same as public | full access, all statuses |
| `property_images` | SELECT (for visible properties) | same | full access |
| `profiles` | none | SELECT and UPDATE own row (not `role` or `is_active`) | SELECT and UPDATE all |
| `viewing_bookings` | none | INSERT as self (active user), SELECT own | full access |
| `valuation_requests` | none | INSERT as self (active user), SELECT own | full access |
| `audit_logs` | none | none | SELECT only |

Because admins have **all privileges**, admin policies grant everything on the tables above, except that `audit_logs` stays append-only (no admin UPDATE or DELETE).

**Differences from the Deliverable 2 schema (deliberate):**

| Item | Change | Reason |
| --- | --- | --- |
| `users` table | Replaced by `profiles` + Supabase Auth | Auth handles hashing, sessions and password reset |
| `password_hash`, `reset_token`, `reset_token_expiry` | Removed | Managed by Supabase Auth |
| `*_id` primary keys | Now `id` (uuid) | Supabase convention. `entity_id` becomes uuid |
| `whatsapp_sent` | Removed | WhatsApp deferred |
| `role` values | `user` / `admin` (was `client` / `admin`) | Per owner decision |
| `approximate_size` | text (ER diagram showed DECIMAL) | Free-form sizes ("50 x 100 ft") |
| `details` in audit_logs | jsonb (was text) | Structured old/new values |
| `properties.is_featured`, `property_images.storage_path` | Added | Home featured strip and file deletion |

### 6.9 Seed Data (demo only, in Phase 2)

- 8–10 properties, a mix of residential and commercial and of sale and rent, in realistic Nairobi areas (Westlands, Kilimani, Lavington, Karen, Runda, Upper Hill, Syokimau, Kiambu Road). Realistic KES prices, 2–3 images each using stable royalty-free image URLs (no upload needed), 3–4 marked `is_featured`, and at least one with `status = 'sold'` so the filtering is visibly working.
- A few sample bookings and valuation requests are optional. Create them after the first test user exists.
- Mark all seed content as demo data in a comment, so it is easy to remove later.

---

## 7. Deferred / Out of Scope for This Build

- **WhatsApp API integration is skipped entirely.** That includes the notification service, any Edge Function for it, the `whatsapp_sent` column, and any WhatsApp buttons, icons or links in the UI. Admin notification for new bookings is **in-app only** (badges, toast, overview lists). Do not add placeholders for it.
- Email notifications beyond Supabase Auth's own emails (confirmation, password reset).
- Payments, online offers, financing calculators, map embeds, multi-language support, and agent/staff roles other than `admin`.

---

## 8. Non-Functional Requirements

**Security (NFR1)**
- Passwords are hashed by Supabase Auth. No password handling in app code.
- All database access goes through `supabase-js` (parameterized, no string-built SQL) and RLS. Admin access is enforced **on the server side by role** through RLS and `is_admin()`.
- No secrets in the frontend bundle beyond the public anon key. No `service_role` key.
- Validate every form with zod on the client, and back it with database constraints.

**Usability (NFR2)**
- One consistent design system across the public site and admin panel.
- Clear, human error messages and loading, empty and error states on every data view.
- Works on desktop and mobile screens, as described in Section 3.6.

**Performance (NFR3)**
- Listing pages load within **about 3 seconds** under normal use, including pages with several images.
- Server-side pagination, select only the columns needed for cards, lazy-load images below the fold, fixed aspect ratios to avoid layout shift, and indexes from Section 6.2.

---

## 9. Phased Build Plan

**Agent rules:**

1. Build **one phase at a time**. Do not start a phase until the owner says "continue".
2. At the end of each phase, stop and report: what was built, how to verify it (URLs and steps), and anything the owner must do manually.
3. Keep the app running on **http://localhost:5175** and verify the phase there, at desktop, tablet and mobile widths.
4. Use the **Supabase MCP** for all database work (named migrations). Never expose the `service_role` key.
5. Do not add features that are not in this PRD. If something is ambiguous, pick the simplest reasonable option, note it in the phase report, and move on.
6. Commit to git at the end of each phase with a message like `phase 3: authentication`.

### Phase 1. Scaffold, Design System & Shell (about 6 min)

- Create the Vite + React + TypeScript project and install the stack from Section 2.1. Configure **port 5175** with `strictPort`.
- Set up Tailwind and shadcn/ui with the design tokens, fonts, and the `<Logo />` component from Section 3.
- Build the shared **layout**: header (responsive, hamburger on mobile, placeholder Log in button), footer, and a page container.
- Set up React Router with routes for every page in Section 5 pointing to simple placeholder pages, plus a 404 page.
- Set up the Supabase client in `src/lib` reading from env vars (values come in Phase 2).
- **Done when:** `npm run dev` serves on 5175, every route renders inside the layout, and the header and footer look on-brand at all three widths.

### Phase 2. Database, RLS, Storage & Seed (about 8 min)

- Using the MCP, apply migrations for: all tables in Section 6.1–6.6, constraints and indexes, `is_admin()`, the `updated_at` triggers, the `auth.users` → `profiles` trigger, the `profiles` protection trigger, the booking slot validation and double-booking index, and the audit trigger function with triggers attached.
- Enable RLS and create all policies from Section 6.8. Create the `property-images` bucket with its policies.
- Add the `record_audit` RPC (admin-only).
- Run the MCP security advisor and fix issues. Generate TypeScript types.
- Write the env vars to `.env.local`. Load the seed data from Section 6.9.
- **Done when:** tables, policies and bucket exist, the advisor reports no RLS problems, and a test query as an anonymous client returns only `available` properties and **no** rows from `profiles`, `viewing_bookings`, `valuation_requests` or `audit_logs`.

### Phase 3. Authentication (about 6 min)

- Remind the owner of the manual Supabase Auth settings in Section 2.3.
- Build register, login, logout, forgot password and reset password pages (Section 5.5) with validation and clear errors.
- Add `useAuth` (session, profile, role), `RequireAuth`, `RequireAdmin`, return-to-previous-page after login, and the header account menu (with the **Admin Panel** link for admins). Handle deactivated users.
- Ask the owner for the email of the first admin. After they register that account, **promote it to `admin` using SQL through the MCP**.
- **Done when:** a new sign-up gets `role = 'user'` in `profiles`; the promoted account sees the Admin Panel link; a normal user visiting `/admin` is redirected; the password reset email link lands on `/reset-password` and works.

### Phase 4. Public Browsing (about 9 min)

- Build the **property card** component, the **Listings page** with filters, sorting, URL-synced query parameters, server-side pagination, skeleton, and empty state (Section 5.3).
- Build the **Property Detail** page with gallery, details, and action buttons (Section 5.4).
- Build the **Home page** with live featured listings and a working quick search (Section 5.2).
- **Done when:** filters combine correctly against live data, Home quick search lands on Listings with filters applied, sold/hidden properties never appear publicly, and pages are responsive.

### Phase 5. Viewing Bookings, Valuations & My Account (about 7 min)

- Build the booking form with the slot rules and database error handling (Section 5.6), including the login redirect and return.
- Build `/valuation/new` (Section 5.7).
- Build `/account/bookings`, `/account/valuations` and `/account/profile` (Section 5.8).
- **Done when:** a signed-in user can book a viewing and get `pending`; booking the same property, date and time again is rejected with a friendly message; an out-of-hours or past slot is rejected; a valuation request saves as `submitted`; both appear in the user's account pages; and audit rows exist for each action.

### Phase 6. Admin Panel: Shell, Overview & Listings (about 9 min)

- Build the admin layout and sidebar with badges, and the **Overview** page (Section 5.9 items 1–2).
- Build **Listings management**: table, search, status filter, add/edit form with every column in Section 6.2, delete with confirmation, and the **multi-image uploader** with primary-image selection and image delete.
- **Done when:** an admin can create a property with images through the UI and it appears on the public Listings page immediately; edit and delete work; a non-admin cannot reach or write to any of it (verify with a direct call as a normal user).

### Phase 7. Admin: Bookings, Valuations & Users (about 6 min)

- Build **Bookings management** (confirm, reschedule with slot rules, close, admin notes) and **Valuations management** (view details, update status, set `handled_by`).
- Build **Users management** (change role, activate/deactivate, with the lockout rules from Section 4).
- Add the **Realtime** subscription for new bookings and valuations (toast and badge update).
- **Done when:** the full main-transaction loop works end to end (user books, admin sees the alert, confirms or reschedules, user sees the new status), valuation status moves through its three states, and role changes take effect. **This is the end of the core build.**

### Phase 8. Reports & Audit Log Viewer (about 5 min, optional if time is short)

- Build **Reports** (Section 5.9 item 6): bookings, valuations and listings reports with their filters, as **PDF (company name and logo in the header)** and **CSV**. Each generation calls `record_audit`.
- Build the **Audit Logs** viewer with filters and pagination.
- **Done when:** each report downloads with correct filtered data and a branded PDF header, and the audit viewer shows entries for the actions taken in earlier phases, including report generation.

### Phase 9. Quality & Responsive Pass (about 4 min, optional if time is short)

- Re-test every public, account and admin page at 1280px, 768px and 390px. Fix overflow, cramped tables and tap targets.
- Check loading, empty and error states, and edge cases (property with one image, no images, long descriptions, missing optional fields).
- Basic accessibility and SEO pass (alt text, focus states, contrast, page titles, semantic headings). Confirm lazy-loading and the 3-second listing target.
- Re-run the Supabase security advisor.
- **Done when:** the Definition of Done below holds for every page.

---

## 10. Definition of Done (per phase)

A phase is complete only when:

1. Everything described for that phase works as specified, against **real Supabase data** (from Phase 2 onward).
2. The UI matches the design language in Section 3 and has been checked at desktop, tablet and mobile widths.
3. Anything the phase depends on from earlier phases (schema, auth, storage) has been confirmed to still work.
4. There are no broken links or console errors, and the app still runs on **port 5175**.
5. Access control is verified at the database level, not only in the UI.
6. The agent has reported what was built and how to verify it, then **stopped** to wait for the owner.