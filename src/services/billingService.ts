import { supabase } from '../lib/supabase';
import { Bill, PaymentStatus } from '../types';

const TABLE = 'bills';

export const billingService = {
  /** Create a new bill */
  async create(
    data: Omit<Bill, 'id' | 'created_at' | 'patient'>,
  ): Promise<{ data: Bill | null; error: any }> {
    const { data: bill, error } = await supabase
      .from(TABLE)
      .insert(data)
      .select('*, patient:patients(*)')
      .single();
    return { data: bill as Bill, error };
  },

  /** Get all bills for a clinic */
  async getAll(clinicId: string): Promise<{ data: Bill[]; error: any }> {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*, patient:patients(*)')
      .eq('clinic_id', clinicId)
      .order('created_at', { ascending: false });
    return { data: (data as Bill[]) || [], error };
  },

  /** Get bills for a specific patient */
  async getByPatient(
    patientId: string,
  ): Promise<{ data: Bill[]; error: any }> {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });
    return { data: (data as Bill[]) || [], error };
  },

  /** Update payment status */
  async updatePaymentStatus(
    id: string,
    status: PaymentStatus,
  ): Promise<{ error: any }> {
    const { error } = await supabase
      .from(TABLE)
      .update({ payment_status: status })
      .eq('id', id);
    return { error };
  },

  /** Get today's total revenue */
  async getTodayRevenue(clinicId: string): Promise<number> {
    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase
      .from(TABLE)
      .select('total')
      .eq('clinic_id', clinicId)
      .eq('payment_status', 'paid')
      .gte('created_at', today);
    return (data || []).reduce((sum, b) => sum + (b.total || 0), 0);
  },
};
