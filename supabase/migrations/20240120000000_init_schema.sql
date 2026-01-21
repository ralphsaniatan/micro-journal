-- Create Profiles Table (Public info for users)
CREATE TABLE public.profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username text,
  avatar_url text,
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS for Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT 
USING (true);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK ((select auth.uid()) = id);

CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
USING ((select auth.uid()) = id);

-- Create Entries Table (Journal entries)
CREATE TABLE public.entries (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL CHECK (char_length(content) <= 240),
  parent_id uuid REFERENCES public.entries(id) ON DELETE CASCADE,
  thread_index int,
  media_urls jsonb DEFAULT '[]'::jsonb,
  tags text[] DEFAULT '{}',
  is_deleted boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  edited_at timestamptz
);

-- Enable RLS for Entries
ALTER TABLE public.entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own entries" 
ON public.entries FOR SELECT 
USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own entries" 
ON public.entries FOR INSERT 
WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own entries" 
ON public.entries FOR UPDATE 
USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own entries" 
ON public.entries FOR DELETE 
USING ((select auth.uid()) = user_id);

-- Simple trigger to create profile on sign up
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
