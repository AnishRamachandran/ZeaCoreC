import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface CustomerUser {
  id: string;
  user_id: string;
  customer_id: string;
  role: string;
  created_at: string;
  updated_at: string;
  customer?: {
    id: string;
    name: string;
    email: string;
    company: string;
    status: string;
    total_spent: number;
    logo_url: string | null;
    created_at: string;
    updated_at: string;
  };
}

export function useCustomerUser() {
  const [customerUser, setCustomerUser] = useState<CustomerUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomerUser = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setCustomerUser(null);
        return;
      }

      // Get customer user link
      const { data, error } = await supabase
        .from('customer_users')
        .select(`
          *,
          customers(*)
        `)
        .eq('user_id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No customer user found, try to create one based on email
          const { data: { user: currentUser } } = await supabase.auth.getUser();
          
          if (currentUser?.email) {
            // Find customer with matching email
            const { data: customerData, error: customerError } = await supabase
              .from('customers')
              .select('*')
              .ilike('email', currentUser.email)
              .single();
            
            if (!customerError && customerData) {
              // Create customer user link
              const { data: newLink, error: linkError } = await supabase
                .from('customer_users')
                .insert([{
                  user_id: currentUser.id,
                  customer_id: customerData.id,
                  role: 'admin' // First user for a customer is admin
                }])
                .select(`
                  *,
                  customers(*)
                `)
                .single();
              
              if (!linkError && newLink) {
                setCustomerUser({
                  ...newLink,
                  customer: newLink.customers
                });
                return;
              }
            }
          }
        }
        
        console.error('Error fetching customer user:', error);
        setError(error.message);
        setCustomerUser(null);
        return;
      }
      
      setCustomerUser({
        ...data,
        customer: data.customers
      });
    } catch (err) {
      console.error('Error in useCustomerUser hook:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      setCustomerUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomerUser();
    
    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchCustomerUser();
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { customerUser, loading, error, refetch: fetchCustomerUser };
}