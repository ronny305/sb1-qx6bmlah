/*
  # Temporarily Disable Email Trigger to Test RLS Issue
  
  ## Problem
  Found a trigger "send_quote_email_on_insert" that fires AFTER INSERT.
  This trigger might be causing the RLS policy violation error.
  
  ## Solution
  Temporarily disable the trigger to test if quote submissions work without it.
  If this fixes the issue, we'll need to fix the trigger or edge function it calls.
  
  ## Testing
  After this migration:
  1. Try inserting via curl with anon key
  2. If successful, the trigger is the problem
  3. Then we can re-enable and fix the trigger properly
*/

-- Disable the email trigger temporarily
ALTER TABLE quote_requests DISABLE TRIGGER send_quote_email_on_insert;

-- Log that we disabled it
DO $$
BEGIN
    RAISE NOTICE 'Temporarily disabled send_quote_email_on_insert trigger for testing';
END $$;
