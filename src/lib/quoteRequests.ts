import { supabase } from './supabase';
import { CartItem } from '../types';

export interface QuoteRequest {
  id?: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  company?: string;
  job_name: string;
  job_number?: string;
  purchase_order_number?: string;
  start_date: string;
  end_date: string;
  shooting_locations: string;
  special_requests?: string;
  items: CartItem[];
  status: 'pending' | 'approved' | 'rejected' | 'in_progress' | 'completed';
  created_at?: string;
  updated_at?: string;
  is_tax_exempt?: boolean;
  discount_amount?: number;
  deleted_at?: string | null;
  deleted_by?: string | null;
  deletion_reason?: string | null;
  is_deleted?: boolean;
}

export interface AuditLogEntry {
  id: string;
  quote_request_id: string;
  action_type: 'deleted' | 'restored' | 'permanently_deleted';
  performed_by: string | null;
  performed_at: string;
  details: any;
  customer_snapshot: any;
  created_at: string;
}

// Create a new quote request
export const createQuoteRequest = async (quoteData: Omit<QuoteRequest, 'id' | 'status' | 'created_at' | 'updated_at'>): Promise<QuoteRequest> => {
  console.log('Creating quote request with data:', quoteData);
  
  const { data, error } = await supabase
    .from('quote_requests')
    .insert([{
      customer_name: quoteData.customer_name,
      customer_email: quoteData.customer_email,
      customer_phone: quoteData.customer_phone,
      company: quoteData.company || null,
      job_name: quoteData.job_name,
      job_number: quoteData.job_number || null,
      purchase_order_number: quoteData.purchase_order_number || null,
      start_date: quoteData.start_date,
      end_date: quoteData.end_date,
      shooting_locations: quoteData.shooting_locations,
      special_requests: quoteData.special_requests || null,
      items: quoteData.items,
      status: 'pending',
      is_tax_exempt: quoteData.is_tax_exempt || false,
      is_deleted: false
    }])
    .select()
    .single();

  console.log('Supabase response:', { data, error });

  if (error) {
    console.error('Error creating quote request:', error);
    throw new Error(`Failed to create quote request: ${error.message}`);
  }

  console.log('Quote request created successfully:', data);
  return data as QuoteRequest;
};

// Fetch all active quote requests (admin only)
export const fetchAllQuoteRequests = async (): Promise<QuoteRequest[]> => {
  const { data, error } = await supabase
    .from('quote_requests')
    .select('*')
    .eq('is_deleted', false)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching quote requests:', error);
    throw new Error('Failed to fetch quote requests');
  }

  return data as QuoteRequest[];
};

// Fetch deleted quote requests (admin only)
export const fetchDeletedQuoteRequests = async (): Promise<QuoteRequest[]> => {
  const { data, error } = await supabase
    .from('quote_requests')
    .select('*')
    .eq('is_deleted', true)
    .order('deleted_at', { ascending: false });

  if (error) {
    console.error('Error fetching deleted quote requests:', error);
    throw new Error('Failed to fetch deleted quote requests');
  }

  return data as QuoteRequest[];
};

// Fetch quote request by ID
export const fetchQuoteRequestById = async (id: string): Promise<QuoteRequest | null> => {
  const { data, error } = await supabase
    .from('quote_requests')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // No rows found
    }
    console.error('Error fetching quote request:', error);
    throw new Error('Failed to fetch quote request');
  }

  return data as QuoteRequest;
};

// Update quote request (general purpose)
export const updateQuoteRequest = async (id: string, updates: Partial<QuoteRequest>): Promise<QuoteRequest> => {
  const { data, error } = await supabase
    .from('quote_requests')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating quote request:', error);
    throw new Error('Failed to update quote request');
  }

  return data as QuoteRequest;
};

// Resend quote email
export const resendQuoteEmail = async (quoteRequestId: string): Promise<void> => {
  // First fetch the complete quote request data
  const quoteRequest = await fetchQuoteRequestById(quoteRequestId);
  
  if (!quoteRequest) {
    throw new Error('Quote request not found');
  }

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase configuration not found');
  }

  const response = await fetch(`${supabaseUrl}/functions/v1/send-quote-email`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${supabaseAnonKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...quoteRequest,
      isResend: true
    })
  });

  let result;
  try {
    result = await response.json();
  } catch (error) {
    const errorText = await response.text();
    console.error('Failed to resend quote email:', errorText);
    throw new Error(`Failed to resend quote email: ${response.status} ${response.statusText}`);
  }

  if (!response.ok) {
    const errorMessage = result?.error || result?.message || 'Unknown error';
    console.error('Failed to resend quote email:', errorMessage);
    throw new Error(`Failed to resend quote email: ${errorMessage}`);
  }

  console.log('Quote email resent successfully:', result);
};

// Update quote request status
export const updateQuoteRequestStatus = async (id: string, status: QuoteRequest['status']): Promise<QuoteRequest> => {
  const { data, error } = await supabase
    .from('quote_requests')
    .update({ 
      status,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating quote request status:', error);
    throw new Error('Failed to update quote request status');
  }

  return data as QuoteRequest;
};

// Soft delete quote request
export const deleteQuoteRequest = async (
  id: string,
  userId: string,
  reason?: string
): Promise<void> => {
  const { data: quoteRequest, error: fetchError } = await supabase
    .from('quote_requests')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError) {
    console.error('Error fetching quote request for deletion:', fetchError);
    throw new Error('Failed to fetch quote request');
  }

  const now = new Date().toISOString();

  const { error: updateError } = await supabase
    .from('quote_requests')
    .update({
      deleted_at: now,
      deleted_by: userId,
      deletion_reason: reason || null,
      is_deleted: true,
      updated_at: now
    })
    .eq('id', id);

  if (updateError) {
    console.error('Error soft deleting quote request:', updateError);
    throw new Error('Failed to delete quote request');
  }

  const { error: auditError } = await supabase
    .from('quote_request_audit_log')
    .insert({
      quote_request_id: id,
      action_type: 'deleted',
      performed_by: userId,
      performed_at: now,
      details: { deletion_reason: reason || null },
      customer_snapshot: {
        customer_name: quoteRequest.customer_name,
        customer_email: quoteRequest.customer_email,
        job_name: quoteRequest.job_name,
        company: quoteRequest.company
      }
    });

  if (auditError) {
    console.error('Error creating audit log entry:', auditError);
  }
};

// Restore soft-deleted quote request
export const restoreQuoteRequest = async (
  id: string,
  userId: string
): Promise<void> => {
  const { data: quoteRequest, error: fetchError } = await supabase
    .from('quote_requests')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError) {
    console.error('Error fetching quote request for restoration:', fetchError);
    throw new Error('Failed to fetch quote request');
  }

  const now = new Date().toISOString();

  const { error: updateError } = await supabase
    .from('quote_requests')
    .update({
      deleted_at: null,
      deleted_by: null,
      deletion_reason: null,
      is_deleted: false,
      updated_at: now
    })
    .eq('id', id);

  if (updateError) {
    console.error('Error restoring quote request:', updateError);
    throw new Error('Failed to restore quote request');
  }

  const { error: auditError } = await supabase
    .from('quote_request_audit_log')
    .insert({
      quote_request_id: id,
      action_type: 'restored',
      performed_by: userId,
      performed_at: now,
      details: {},
      customer_snapshot: {
        customer_name: quoteRequest.customer_name,
        customer_email: quoteRequest.customer_email,
        job_name: quoteRequest.job_name,
        company: quoteRequest.company
      }
    });

  if (auditError) {
    console.error('Error creating audit log entry:', auditError);
  }
};

// Permanently delete quote request (hard delete)
export const permanentlyDeleteQuoteRequest = async (
  id: string,
  userId: string
): Promise<void> => {
  const { data: quoteRequest, error: fetchError } = await supabase
    .from('quote_requests')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError) {
    console.error('Error fetching quote request for permanent deletion:', fetchError);
    throw new Error('Failed to fetch quote request');
  }

  const now = new Date().toISOString();

  const { error: auditError } = await supabase
    .from('quote_request_audit_log')
    .insert({
      quote_request_id: id,
      action_type: 'permanently_deleted',
      performed_by: userId,
      performed_at: now,
      details: {},
      customer_snapshot: {
        customer_name: quoteRequest.customer_name,
        customer_email: quoteRequest.customer_email,
        job_name: quoteRequest.job_name,
        company: quoteRequest.company
      }
    });

  if (auditError) {
    console.error('Error creating audit log entry:', auditError);
  }

  const { error: deleteError } = await supabase
    .from('quote_requests')
    .delete()
    .eq('id', id);

  if (deleteError) {
    console.error('Error permanently deleting quote request:', deleteError);
    throw new Error('Failed to permanently delete quote request');
  }
};

// Fetch audit logs for a specific quote or all quotes
export const fetchAuditLogs = async (quoteRequestId?: string): Promise<AuditLogEntry[]> => {
  let query = supabase
    .from('quote_request_audit_log')
    .select('*')
    .order('performed_at', { ascending: false });

  if (quoteRequestId) {
    query = query.eq('quote_request_id', quoteRequestId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching audit logs:', error);
    throw new Error('Failed to fetch audit logs');
  }

  return data as AuditLogEntry[];
};

// Fetch pending quote requests count for admin dashboard
export const fetchPendingQuoteRequestsCount = async (): Promise<number> => {
  console.log('fetchPendingQuoteRequestsCount: Calling Supabase to count pending quote requests...');
  const { count, error } = await supabase
    .from('quote_requests')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending')
    .eq('is_deleted', false);

  if (error) {
    console.error('fetchPendingQuoteRequestsCount: Supabase error:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code
    });
    throw new Error(`Failed to fetch pending quote requests count: ${error.message}`);
  }

  console.log('fetchPendingQuoteRequestsCount: Pending quote requests count:', count);
  return count || 0;
};

// Fetch total quote requests count for admin dashboard
export const fetchTotalQuoteRequestsCount = async (): Promise<number> => {
  console.log('fetchTotalQuoteRequestsCount: Calling Supabase to count all quote requests...');
  const { count, error } = await supabase
    .from('quote_requests')
    .select('*', { count: 'exact', head: true })
    .eq('is_deleted', false);

  if (error) {
    console.error('fetchTotalQuoteRequestsCount: Supabase error:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code
    });
    throw new Error(`Failed to fetch total quote requests count: ${error.message}`);
  }

  console.log('fetchTotalQuoteRequestsCount: Total quote requests count:', count);
  return count || 0;
};

// Get quote requests by status
export const fetchQuoteRequestsByStatus = async (status: QuoteRequest['status']): Promise<QuoteRequest[]> => {
  const { data, error } = await supabase
    .from('quote_requests')
    .select('*')
    .eq('status', status)
    .eq('is_deleted', false)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching quote requests by status:', error);
    throw new Error('Failed to fetch quote requests');
  }

  return data as QuoteRequest[];
};

// Fetch recent quote requests for admin dashboard
export const fetchRecentQuoteRequests = async (limit = 5): Promise<any[]> => {
  console.log(`fetchRecentQuoteRequests: Calling Supabase to fetch ${limit} recent quote requests...`);
  const { data, error } = await supabase
    .from('quote_requests')
    .select('id, customer_name, job_name, created_at, updated_at')
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('fetchRecentQuoteRequests: Supabase error:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code
    });
    throw new Error(`Failed to fetch recent quote requests: ${error.message}`);
  }

  console.log('fetchRecentQuoteRequests: Recent quote requests data received:', data);
  return data || [];
};

// Generate PDF for quote request
export const generateQuotePdf = async (quoteRequestId: string): Promise<{ pdf: string; filename: string }> => {
  console.log('Generating PDF for quote request ID:', quoteRequestId);
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase configuration not found');
  }

  const response = await fetch(`${supabaseUrl}/functions/v1/generate-quote-pdf`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${supabaseAnonKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ quoteRequestId }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error('Error generating PDF:', errorData);
    throw new Error(`Failed to generate PDF: ${errorData.error || 'Unknown error'}`);
  }

  const result = await response.json();
  return { pdf: result.pdf, filename: result.filename };
};