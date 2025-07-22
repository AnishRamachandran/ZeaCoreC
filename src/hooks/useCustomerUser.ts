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

      // Get customer user link (without nested customer data to avoid relationship issues)
      const { data, error } = await supabase
        .from('customer_users')
        .select('*')
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
                .select('*')
                .single();
              
              if (!linkError && newLink) {
                // Fetch customer data separately
                const { data: customerInfo, error: customerInfoError } = await supabase
                  .from('customers')
                  .select('*')
                  .eq('id', newLink.customer_id)
                  .single();
                
                if (!customerInfoError && customerInfo) {
                  setCustomerUser({
                    ...newLink,
                    customer: customerInfo
                  });
                  return;
                }
              }
            }
          }
        }
        
        console.error('Error fetching customer user:', error);
        setError(error.message);
        setCustomerUser(null);
        return;
      }
      
      // Fetch customer data separately to avoid relationship issues
      const { data: customerData, error: customerError } = await supabase
        .from('customers')
        .select('*')
        .eq('id', data.customer_id)
        .single();
      
      if (customerError) {
        console.error('Error fetching customer data:', customerError);
        setError(customerError.message);
        setCustomerUser(null);
        return;
      }
      
      setCustomerUser({
        ...data,
        customer: customerData
      });
    } catch (error) {
      // First check if the customer_users table exists by attempting a simple query
      const { data, error: err } = await supabase
        .from('customer_users')
        .select('*')
        .eq('user_id', user.id)
        .single();
      setCustomerUser(null);
    } finally {
      // If table doesn't exist, return null instead of throwing
      if (error.code === '42P01') {
        console.warn('customer_users table does not exist. User will be treated as non-customer user.');
        return null;
      }
      throw error;
    }
  };

  useEffect(() => {
    // Handle the case where table doesn't exist gracefully
    if (error instanceof Error && error.message.includes('relation "public.customer_users" does not exist')) {
      console.warn('customer_users table does not exist. User will be treated as non-customer user.');
      return null;
    }
    console.error('Error fetching customer user:', error);
    throw error;
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