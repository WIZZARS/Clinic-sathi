-- ─── ClinicSathi Database Schema ────────────────────────────────────────────
-- Run this in your Supabase SQL Editor to create all tables

-- 1. Clinics Table
CREATE TABLE IF NOT EXISTS clinics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  logo_url TEXT,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Patients Table
CREATE TABLE IF NOT EXISTS patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id TEXT NOT NULL UNIQUE,   -- e.g. CS-2025-0001
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  age INTEGER NOT NULL CHECK (age > 0 AND age <= 120),
  gender TEXT NOT NULL CHECK (gender IN ('male', 'female', 'other')),
  address TEXT NOT NULL,
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Appointments Table
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_name TEXT NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'booked'
    CHECK (status IN ('booked', 'completed', 'cancelled', 'no_show')),
  notes TEXT,
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Bills Table
CREATE TABLE IF NOT EXISTS bills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES appointments(id),
  items JSONB NOT NULL DEFAULT '[]',   -- Array of {name, price}
  total NUMERIC(10, 2) NOT NULL DEFAULT 0,
  payment_status TEXT NOT NULL DEFAULT 'unpaid'
    CHECK (payment_status IN ('paid', 'unpaid')),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Row Level Security ──────────────────────────────────────────────────────

-- Enable RLS on all tables
ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;

-- Clinic owner can see their own clinic
CREATE POLICY "clinic_owner_policy" ON clinics
  FOR ALL USING (auth.uid() = owner_id);

-- Staff can access patients/appointments/bills in their clinic
-- (Simplified: link auth user to clinic via clinics table)
CREATE POLICY "patients_clinic_policy" ON patients
  FOR ALL USING (
    clinic_id IN (SELECT id FROM clinics WHERE owner_id = auth.uid())
  );

CREATE POLICY "appointments_clinic_policy" ON appointments
  FOR ALL USING (
    clinic_id IN (SELECT id FROM clinics WHERE owner_id = auth.uid())
  );

CREATE POLICY "bills_clinic_policy" ON bills
  FOR ALL USING (
    clinic_id IN (SELECT id FROM clinics WHERE owner_id = auth.uid())
  );

-- ─── Indexes for search performance ──────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_patients_clinic ON patients(clinic_id);
CREATE INDEX IF NOT EXISTS idx_patients_name ON patients(full_name);
CREATE INDEX IF NOT EXISTS idx_patients_phone ON patients(phone);
CREATE INDEX IF NOT EXISTS idx_appointments_clinic_date ON appointments(clinic_id, appointment_date);
CREATE INDEX IF NOT EXISTS idx_bills_clinic ON bills(clinic_id);
CREATE INDEX IF NOT EXISTS idx_bills_patient ON bills(patient_id);
