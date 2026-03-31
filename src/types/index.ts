// ─── Database Types (mirrors Supabase schema) ─────────────────────────────────

export type Gender = 'male' | 'female' | 'other';
export type AppointmentStatus = 'booked' | 'completed' | 'cancelled' | 'no_show';
export type PaymentStatus = 'paid' | 'unpaid';

export interface Patient {
  id: string;           // UUID (Supabase auto-generated)
  patient_id: string;   // e.g. "CS-2025-0001" – human readable
  full_name: string;
  phone: string;
  age: number;
  gender: Gender;
  address: string;      // district/city
  clinic_id: string;
  created_at: string;
}

export interface Appointment {
  id: string;
  patient_id: string;
  patient?: Patient;
  doctor_name: string;
  appointment_date: string; // ISO date string
  appointment_time: string; // e.g. "10:30"
  status: AppointmentStatus;
  notes?: string;
  clinic_id: string;
  created_at: string;
}

export interface BillItem {
  name: string;
  price: number;
}

export interface Bill {
  id: string;
  patient_id: string;
  patient?: Patient;
  appointment_id?: string;
  items: BillItem[];
  total: number;
  payment_status: PaymentStatus;
  clinic_id: string;
  created_at: string;
}

export interface Clinic {
  id: string;
  name: string;
  phone?: string;
  address?: string;
  logo_url?: string;
}

export interface DashboardStats {
  total_patients_today: number;
  upcoming_appointments: number;
  total_revenue_today: number;
  appointments_today: Appointment[];
}
