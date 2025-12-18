-- Create table for storing client access codes
create table if not exists public.client_access (
  id uuid default gen_random_uuid() primary key,
  client_name text not null unique,
  access_code text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_by uuid references auth.users(id)
);

-- Enable RLS
alter table public.client_access enable row level security;

-- Policies: Only authenticated users (Staff: Admin/Secretary) can manage these keys
-- Clients access this data ONLY via the security definer function below
create policy "Staff can view client access codes"
  on public.client_access for select
  using (auth.role() = 'authenticated');

create policy "Staff can insert client access codes"
  on public.client_access for insert
  with check (auth.role() = 'authenticated');

create policy "Staff can update client access codes"
  on public.client_access for update
  using (auth.role() = 'authenticated');

create policy "Staff can delete client access codes"
  on public.client_access for delete
  using (auth.role() = 'authenticated');

-- RPC Function for secure verification
-- This runs with SECURITY DEFINER to bypass RLS, allowing unauthenticated clients to verify credentials
create or replace function public.verify_client_access(p_client_name text, p_access_code text)
returns boolean
language plpgsql
security definer
as $$
begin
  -- Case-insensitive check for robustness
  return exists (
    select 1
    from public.client_access
    where lower(client_name) = lower(p_client_name)
    and access_code = p_access_code
  );
end;
$$;

-- Function to get or create an access code (Optional helper for frontend convenience, but frontend can just insert)
-- We'll rely on frontend logic to check existence first, then insert if needed.
