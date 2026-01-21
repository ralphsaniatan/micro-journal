-- Create table for storing shared links
create table shared_links (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  label text not null,
  token uuid default gen_random_uuid() unique not null,
  created_at timestamptz default now() not null
);

-- Create table for tracking views
create table shared_views (
  id uuid default gen_random_uuid() primary key,
  link_id uuid references shared_links(id) on delete cascade not null,
  viewer_name text not null,
  viewed_at timestamptz default now() not null
);

-- RLS Policies for shared_links
alter table shared_links enable row level security;

create policy "Users can view their own shared links"
  on shared_links for select
  using (auth.uid() = user_id);

create policy "Users can create shared links"
  on shared_links for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own shared links"
  on shared_links for delete
  using (auth.uid() = user_id);

-- RLS Policies for shared_views
alter table shared_views enable row level security;

-- Only the owner of the link can view the history
create policy "Users can view history of their links"
  on shared_views for select
  using (
    exists (
      select 1 from shared_links
      where shared_links.id = shared_views.link_id
      and shared_links.user_id = auth.uid()
    )
  );

-- Insert policy is handled by Server Action (Admin) or we can allow public insert if link_id exists?
-- Better to stick to Service Role for guest insertions to be safe.
