import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useCustomerUser } from './useCustomerUser';

export interface Ticket {
  id: string;
  title: string;
  description: string | null;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  customer_id: string | null;
  assigned_to: string | null;
  app_id: string | null;
  external_id: string | null;
  due_date: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  customer_name?: string;
  customer_company?: string;
  assignee_name?: string;
  app_name?: string;
}

export interface TicketComment {
  id: string;
  ticket_id: string;
  user_id: string;
  content: string;
  is_internal: boolean;
  created_at: string;
  updated_at: string;
  // Joined fields
  user_name?: string;
  user_avatar_url?: string;
}

export interface TicketAttachment {
  id: string;
  ticket_id: string;
  user_id: string;
  file_name: string;
  file_url: string;
  file_type: string | null;
  file_size: number | null;
  created_at: string;
  // Joined fields
  user_name?: string;
}

export interface TicketStats {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
  urgent: number;
  high: number;
  medium: number;
  low: number;
  overdue: number;
  dueToday: number;
  dueTomorrow: number;
  unassigned: number;
}

export function useTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { customerUser } = useCustomerUser();

  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let query = supabase
        .from('tickets')
        .select(`
          *,
          customers(name, company),
          user_profiles!tickets_assigned_to_fkey(first_name, last_name, avatar_url),
          apps(name)
        `);
      
      // Filter by customer ID if available
      if (customerUser?.customer_id) {
        query = query.eq('customer_id', customerUser.customer_id);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      
      const ticketsWithDetails = (data || []).map(ticket => ({
        ...ticket,
        customer_name: ticket.customers?.name,
        customer_company: ticket.customers?.company,
        assignee_name: ticket.user_profiles ? 
          `${ticket.user_profiles.first_name} ${ticket.user_profiles.last_name}` : 
          null,
        app_name: ticket.apps?.name
      }));
      
      setTickets(ticketsWithDetails);
    } catch (err) {
      console.error('Error fetching tickets:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [customerUser?.customer_id]);

  return { tickets, loading, error, refetch: fetchTickets };
}

export function useTicketDetails(ticketId: string | null) {
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [comments, setComments] = useState<TicketComment[]>([]);
  const [attachments, setAttachments] = useState<TicketAttachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTicketDetails = async () => {
    if (!ticketId) {
      setTicket(null);
      setComments([]);
      setAttachments([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Fetch ticket with related data
      const { data: ticketData, error: ticketError } = await supabase
        .from('tickets')
        .select(`
          *,
          customers(name, company),
          user_profiles!tickets_assigned_to_fkey(first_name, last_name, avatar_url),
          apps(name)
        `)
        .eq('id', ticketId)
        .single();

      if (ticketError) throw ticketError;
      
      // Fetch comments for this ticket
      const { data: commentsData, error: commentsError } = await supabase
        .from('ticket_comments')
        .select(`
          *,
          user_profiles(first_name, last_name, avatar_url)
        `)
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });

      if (commentsError) throw commentsError;
      
      // Fetch attachments for this ticket
      const { data: attachmentsData, error: attachmentsError } = await supabase
        .from('ticket_attachments')
        .select(`
          *,
          user_profiles(first_name, last_name)
        `)
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: false });

      if (attachmentsError) throw attachmentsError;
      
      // Process and set data
      const ticketWithDetails = {
        ...ticketData,
        customer_name: ticketData.customers?.name,
        customer_company: ticketData.customers?.company,
        assignee_name: ticketData.user_profiles ? 
          `${ticketData.user_profiles.first_name} ${ticketData.user_profiles.last_name}` : 
          null,
        app_name: ticketData.apps?.name
      };
      
      const commentsWithDetails = (commentsData || []).map(comment => ({
        ...comment,
        user_name: comment.user_profiles ? 
          `${comment.user_profiles.first_name} ${comment.user_profiles.last_name}` : 
          'Unknown User',
        user_avatar_url: comment.user_profiles?.avatar_url
      }));
      
      const attachmentsWithDetails = (attachmentsData || []).map(attachment => ({
        ...attachment,
        user_name: attachment.user_profiles ? 
          `${attachment.user_profiles.first_name} ${attachment.user_profiles.last_name}` : 
          'Unknown User'
      }));
      
      setTicket(ticketWithDetails);
      setComments(commentsWithDetails);
      setAttachments(attachmentsWithDetails);
    } catch (err) {
      console.error('Error fetching ticket details:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicketDetails();
  }, [ticketId]);

  const addComment = async (content: string, isInternal: boolean = false) => {
    if (!ticketId) return null;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('ticket_comments')
        .insert([{
          ticket_id: ticketId,
          user_id: user.id,
          content,
          is_internal: isInternal
        }])
        .select()
        .single();

      if (error) throw error;
      
      await fetchTicketDetails();
      return data;
    } catch (err) {
      console.error('Error adding comment:', err);
      return null;
    }
  };

  const updateTicket = async (updates: Partial<Ticket>) => {
    if (!ticketId) return false;
    
    try {
      const { error } = await supabase
        .from('tickets')
        .update(updates)
        .eq('id', ticketId);

      if (error) throw error;
      
      await fetchTicketDetails();
      return true;
    } catch (err) {
      console.error('Error updating ticket:', err);
      return false;
    }
  };

  return { 
    ticket, 
    comments, 
    attachments, 
    loading, 
    error, 
    refetch: fetchTicketDetails,
    addComment,
    updateTicket
  };
}

export function useTicketStats() {
  const [stats, setStats] = useState<TicketStats>({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
    closed: 0,
    urgent: 0,
    high: 0,
    medium: 0,
    low: 0,
    overdue: 0,
    dueToday: 0,
    dueTomorrow: 0,
    unassigned: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTicketStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('tickets')
        .select('*');

      if (error) throw error;
      
      const tickets = data || [];
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const dayAfterTomorrow = new Date(today);
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
      
      setStats({
        total: tickets.length,
        open: tickets.filter(t => t.status === 'open').length,
        inProgress: tickets.filter(t => t.status === 'in_progress').length,
        resolved: tickets.filter(t => t.status === 'resolved').length,
        closed: tickets.filter(t => t.status === 'closed').length,
        urgent: tickets.filter(t => t.priority === 'urgent').length,
        high: tickets.filter(t => t.priority === 'high').length,
        medium: tickets.filter(t => t.priority === 'medium').length,
        low: tickets.filter(t => t.priority === 'low').length,
        overdue: tickets.filter(t => {
          if (!t.due_date) return false;
          const dueDate = new Date(t.due_date);
          return dueDate < today && t.status !== 'closed' && t.status !== 'resolved';
        }).length,
        dueToday: tickets.filter(t => {
          if (!t.due_date) return false;
          const dueDate = new Date(t.due_date);
          return dueDate >= today && dueDate < tomorrow && t.status !== 'closed' && t.status !== 'resolved';
        }).length,
        dueTomorrow: tickets.filter(t => {
          if (!t.due_date) return false;
          const dueDate = new Date(t.due_date);
          return dueDate >= tomorrow && dueDate < dayAfterTomorrow && t.status !== 'closed' && t.status !== 'resolved';
        }).length,
        unassigned: tickets.filter(t => !t.assigned_to && t.status !== 'closed' && t.status !== 'resolved').length
      });
    } catch (err) {
      console.error('Error fetching ticket stats:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicketStats();
  }, []);

  return { stats, loading, error, refetch: fetchTicketStats };
}

export function useCreateTicket() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const createTicket = async (ticketData: {
    title: string;
    description?: string;
    status?: 'open' | 'in_progress' | 'resolved' | 'closed';
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    customer_id?: string;
    assigned_to?: string;
    app_id?: string;
    external_id?: string;
    due_date?: string;
  }) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);
      
      const { data, error } = await supabase
        .from('tickets')
        .insert([{
          title: ticketData.title,
          description: ticketData.description || null,
          status: ticketData.status || 'open',
          priority: ticketData.priority || 'medium',
          customer_id: ticketData.customer_id || null,
          assigned_to: ticketData.assigned_to || null,
          app_id: ticketData.app_id || null,
          external_id: ticketData.external_id || null,
          due_date: ticketData.due_date || null
        }])
        .select()
        .single();

      if (error) throw error;
      
      setSuccess(true);
      return data;
    } catch (err) {
      console.error('Error creating ticket:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { createTicket, loading, error, success };
}