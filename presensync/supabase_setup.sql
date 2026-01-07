-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- PROFILES
create table public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  role text check (role in ('student', 'lecturer', 'admin')) default 'student',
  full_name text,
  student_id text, -- optional, for students
  department text,
  avatar_url text
);

-- RLS for Profiles
alter table public.profiles enable row level security;
create policy "Public profiles are viewable by everyone" on public.profiles for select using (true);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- COURSES
create table public.courses (
  id uuid default uuid_generate_v4() primary key,
  code text not null,
  name text not null,
  semester text,
  lecturer_id uuid references public.profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- COURSE ENROLLMENTS
create table public.course_enrollments (
  id uuid default uuid_generate_v4() primary key,
  course_id uuid references public.courses(id) on delete cascade,
  student_id uuid references public.profiles(id) on delete cascade,
  enrolled_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(course_id, student_id)
);

-- CLASSES
create table public.classes (
  id uuid default uuid_generate_v4() primary key,
  course_id uuid references public.courses(id) on delete cascade,
  title text, -- e.g. "Lecture 1"
  room text,
  start_time timestamp with time zone not null,
  end_time timestamp with time zone not null,
  qr_code_url text, -- generated QR content or URL
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ATTENDANCE RECORDS
create table public.attendance_records (
  id uuid default uuid_generate_v4() primary key,
  class_id uuid references public.classes(id) on delete cascade,
  student_id uuid references public.profiles(id) on delete cascade,
  status text check (status in ('present', 'absent', 'late')) default 'present',
  method text check (method in ('qr', 'manual')) default 'qr',
  timestamp timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(class_id, student_id)
);

-- LEAVES
create table public.leaves (
  id uuid default uuid_generate_v4() primary key,
  student_id uuid references public.profiles(id) on delete cascade,
  start_date date not null,
  end_date date not null,
  reason text,
  status text check (status in ('pending', 'approved', 'rejected')) default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', coalesce(new.raw_user_meta_data->>'role', 'student'));
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


