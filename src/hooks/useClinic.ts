import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Hook to get the current user's clinic ID and name.
 * Fetches the clinic linked to the authenticated user.
 */
export function useClinic() {
  const [clinicId, setClinicId] = useState<string | null>(null);
  const [clinicName, setClinicName] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClinic = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('clinics')
          .select('id, name')
          .eq('owner_id', user.id)
          .single();

        if (data) {
          setClinicId(data.id);
          setClinicName(data.name);
        } else if (error) {
          // If no clinic found, create one automatically
          const name = user.user_metadata?.clinic_name || 'My Clinic';
          const { data: newClinic } = await supabase
            .from('clinics')
            .insert({
              name,
              owner_id: user.id,
            })
            .select('id, name')
            .single();
          if (newClinic) {
            setClinicId(newClinic.id);
            setClinicName(newClinic.name);
          }
        }
      } catch (e) {
        console.error('Failed to fetch clinic:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchClinic();
  }, []);

  return { clinicId, clinicName, loading };
}
