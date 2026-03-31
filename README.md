# 🏥 ClinicSathi — Nepal Clinic Management App

A mobile application for small private clinics in Nepal to manage patients, appointments, and billing — all in one place.

**Built with:** React Native (Expo) + Supabase (PostgreSQL + Auth)
**Languages:** English & Nepali

---

## 📁 Project Structure

```
clinicsathi/
├── App.tsx                          # Entry point
├── app.json                         # Expo config
├── package.json
├── babel.config.js
├── tsconfig.json
├── .env.example                     # Credentials template
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql   # ← Run this in Supabase SQL Editor
└── src/
    ├── lib/
    │   └── supabase.ts              # Supabase client
    ├── types/index.ts               # TypeScript types
    ├── theme/index.ts               # Design system
    ├── localization/
    │   ├── en.ts                    # English strings
    │   ├── ne.ts                    # Nepali strings
    │   └── i18n.ts                  # i18next setup
    ├── services/
    │   ├── patientsService.ts
    │   ├── appointmentsService.ts
    │   └── billingService.ts
    ├── components/
    │   ├── Button.tsx
    │   ├── Input.tsx
    │   ├── Cards.tsx
    │   └── Header.tsx
    ├── screens/
    │   ├── LoginScreen.tsx
    │   ├── DashboardScreen.tsx
    │   ├── PatientsScreen.tsx
    │   ├── AddPatientScreen.tsx
    │   ├── AppointmentsScreen.tsx
    │   ├── AddAppointmentScreen.tsx
    │   ├── BillingScreen.tsx
    │   └── AddBillScreen.tsx
    └── navigation/
        └── AppNavigator.tsx
```

---

## 🚀 Setup Instructions

### Step 1: Supabase Setup

1. Go to [supabase.com](https://supabase.com) and create a new project.
2. Once the project is ready, open **SQL Editor** and paste the contents of:
   `supabase/migrations/001_initial_schema.sql`
3. Click **Run** to create all tables and security policies.
4. Go to **Settings → API** and copy:
   - Project URL
   - `anon` public key

### Step 2: Environment Variables

Copy `.env.example` to `.env` and fill in your Supabase credentials:

```bash
cp .env.example .env
```

```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
```

### Step 3: Install Dependencies

```bash
cd clinicsathi
npm install
```

### Step 4: Run the App

```bash
# Start development server
npm start

# Or run directly on Android
npm run android

# Or run on iOS
npm run ios
```

> **Requirements:** Node.js 18+, Expo CLI, Android Studio / Xcode

---

## 🗺️ Features (MVP Phase 1)

| Feature | Status |
|---|---|
| ✅ Login (Email + Password) | Done |
| ✅ Dashboard (Stats + Schedule) | Done |
| ✅ Patient Registration (auto ID) | Done |
| ✅ Patient Search (by name/phone) | Done |
| ✅ Appointment Booking (calendar) | Done |
| ✅ Appointment Status Management | Done |
| ✅ Create Bill with Services | Done |
| ✅ Mark Bill as Paid/Unpaid | Done |
| ✅ English + Nepali toggle | Done |
| 🔄 Receipt PDF generation | Phase 2 |
| 🔄 SMS reminders | Phase 2 |
| 🔄 Doctor notes | Phase 2 |

---

## 🎨 Design System

- **Colors:** Deep Violet (`#4C3BCF`) + Teal (`#00B4D8`)
- **Font Scale:** Large text for accessibility (min 14px, buttons at 18px)
- **Min Touch Target:** 52px height on all interactive elements
- **Languages:** Toggle between English and Nepali on every screen

---

## 🔐 Connecting Clinic ID

The app currently uses a placeholder `CLINIC_ID = 'demo-clinic-id'`. After implementing full auth:

1. When a user registers, create their clinic in the `clinics` table.
2. Store the clinic ID with their session context.
3. Replace `CLINIC_ID` with a `useAuth()` hook that returns the authenticated clinic ID.

---

## 📦 Deployment (Android APK)

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to your Expo account
eas login

# Configure build
eas build:configure

# Build Android APK for testing
eas build --platform android --profile preview
```
