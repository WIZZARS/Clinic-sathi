import { supabase } from '../lib/supabase';
import { Appointment, AppointmentStatus } from '../types';

const TABLE = 'appointments';

export const appointmentsService = {
  /** Get all appointments for a clinic on a specific date */
  async getByDate(
    clinicId: string,
    date: string,
  ): Promise<{ data: Appointment[]; error: any }> {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*, patient:patients(*)')
      .eq('clinic_id', clinicId)
      .eq('appointment_date', date)
      .order('appointment_time');
    return { data: (data as Appointment[]) || [], error };
  },

  /** Get upcoming appointments (tomorrow and future) */
  async getUpcoming(clinicId: string): Promise<{ data: Appointment[]; error: any }> {
    const d = new Date();
    const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const { data, error } = await supabase
      .from(TABLE)
      .select('*, patient:patients(*)')
      .eq('clinic_id', clinicId)
      .gt('appointment_date', today)
      .eq('status', 'booked')
      .order('appointment_date')
      .order('appointment_time')
      .limit(20);
    return { data: (data as Appointment[]) || [], error };
  },

  /** Get all appointments for a specific patient */
  async getByPatient(
    patientId: string,
  ): Promise<{ data: Appointment[]; error: any }> {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .eq('patient_id', patientId)
      .order('appointment_date', { ascending: false });
    return { data: (data as Appointment[]) || [], error };
  },

  /** Book a new appointment */
  async create(
    data: Omit<Appointment, 'id' | 'created_at' | 'patient'>,
  ): Promise<{ data: Appointment | null; error: any }> {
    const { data: appt, error } = await supabase
      .from(TABLE)
      .insert(data)
      .select('*, patient:patients(*)')
      .single();
    return { data: appt as Appointment, error };
  },

  /** Update appointment status */
  async updateStatus(
    id: string,
    status: AppointmentStatus,
  ): Promise<{ error: any }> {
    const { error } = await supabase
      .from(TABLE)
      .update({ status })
      .eq('id', id);
    return { error };
  },

  /** Count today's appointments */
  async countToday(clinicId: string): Promise<number> {
    const d = new Date();
    const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const { count } = await supabase
      .from(TABLE)
      .select('*', { count: 'exact', head: true })
      .eq('clinic_id', clinicId)
      .eq('appointment_date', today);
    return count || 0;
  },
};
