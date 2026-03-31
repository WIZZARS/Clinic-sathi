import { supabase } from '../lib/supabase';
import { Patient } from '../types';

const TABLE = 'patients';

/** Generate a human-readable Patient ID like CS-2025-0001 */
const generatePatientId = async (clinicId: string): Promise<string> => {
  const year = new Date().getFullYear();
  const { count } = await supabase
    .from(TABLE)
    .select('*', { count: 'exact', head: true })
    .eq('clinic_id', clinicId);

  const seq = String((count || 0) + 1).padStart(4, '0');
  return `CS-${year}-${seq}`;
};

export const patientsService = {
  /** Register a new patient */
  async create(
    data: Omit<Patient, 'id' | 'patient_id' | 'created_at'>,
  ): Promise<{ data: Patient | null; error: any }> {
    const patient_id = await generatePatientId(data.clinic_id);
    const { data: patient, error } = await supabase
      .from(TABLE)
      .insert({ ...data, patient_id })
      .select()
      .single();
    return { data: patient, error };
  },

  /** Get all patients for a clinic */
  async getAll(clinicId: string): Promise<{ data: Patient[]; error: any }> {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .eq('clinic_id', clinicId)
      .order('created_at', { ascending: false });
    return { data: data || [], error };
  },

  /** Search patients by name or phone */
  async search(
    clinicId: string,
    query: string,
  ): Promise<{ data: Patient[]; error: any }> {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .eq('clinic_id', clinicId)
      .or(`full_name.ilike.%${query}%,phone.ilike.%${query}%`)
      .order('full_name');
    return { data: data || [], error };
  },

  /** Get a single patient by ID */
  async getById(id: string): Promise<{ data: Patient | null; error: any }> {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .eq('id', id)
      .single();
    return { data, error };
  },

  /** Delete a patient by ID */
  async deletePatient(id: string): Promise<{ error: any }> {
    const { error } = await supabase
      .from(TABLE)
      .delete()
      .eq('id', id);
    return { error };
  },
};
