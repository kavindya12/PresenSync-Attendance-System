-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES (Linked to auth.users)
create table if not exists public.profiles (
  id uuid NOT NULL PRIMARY KEY REFERENCES auth.users(id),
  email text unique,
  role text check (role in ('student', 'lecturer', 'admin')) default 'student',
  full_name text,
  student_id text unique,
  department text,
  avatar_url text,
  updated_at timestamp with time zone default now()
);

-- Enable RLS on profiles
alter table public.profiles enable row level security;

-- Policies for Profiles (drop if exists, then create)
drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile" on public.profiles 
  for select using (auth.uid() = id);

drop policy if exists "Staff can view student profiles" on public.profiles;
create policy "Staff can view student profiles" on public.profiles 
  for select using (
    exists (
      select 1 from public.profiles
      where id = auth.uid()
      and role in ('lecturer', 'admin')
    )
  );

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles 
  for update using (auth.uid() = id);

-- 2. COURSES
create table if not exists public.courses (
  id uuid default uuid_generate_v4() primary key,
  code text not null,
  name text not null,
  semester text,
  department text,
  lecturer_id uuid references public.profiles(id) not null,
  created_at timestamp with time zone default now() not null
);

-- Enable RLS on courses
alter table public.courses enable row level security;

-- Policies for Courses (Fixed: Split into individual statements)
drop policy if exists "View courses" on public.courses;
create policy "View courses" on public.courses 
  for select using (true);

drop policy if exists "Lecturers update own courses" on public.courses;
create policy "Lecturers update own courses" on public.courses 
  for update using (auth.uid() = lecturer_id);

drop policy if exists "Lecturers delete own courses" on public.courses;
create policy "Lecturers delete own courses" on public.courses 
  for delete using (auth.uid() = lecturer_id);

drop policy if exists "Lecturers create courses" on public.courses;
create policy "Lecturers create courses" on public.courses 
  for insert with check (auth.uid() = lecturer_id);

-- 3. COURSE ENROLLMENTS
create table if not exists public.course_enrollments (
  id uuid default uuid_generate_v4() primary key,
  course_id uuid references public.courses(id) on delete cascade,
  student_id uuid references public.profiles(id) on delete cascade,
  enrolled_at timestamp with time zone default now() not null,
  unique(course_id, student_id)
);

-- Enable RLS on enrollments
alter table public.course_enrollments enable row level security;

-- Policies for Enrollments
drop policy if exists "Students can see their own enrollments" on public.course_enrollments;
create policy "Students can see their own enrollments" on public.course_enrollments 
  for select using (auth.uid() = student_id);

drop policy if exists "Lecturers can see student enrollments in their courses" on public.course_enrollments;
create policy "Lecturers can see student enrollments in their courses" on public.course_enrollments
  for select using (
    exists (
      select 1 from public.courses 
      where id = course_enrollments.course_id 
      and lecturer_id = auth.uid()
    )
  );

-- 4. CLASSES
create table if not exists public.classes (
  id uuid default uuid_generate_v4() primary key,
  course_id uuid references public.courses(id) on delete cascade,
  title text not null,
  room text,
  start_time timestamp with time zone not null,
  end_time timestamp with time zone not null,
  qr_code_content text,
  created_at timestamp with time zone default now() not null
);

-- Enable RLS on classes
alter table public.classes enable row level security;

-- Policies for Classes
drop policy if exists "Classes are viewable by students in course and lecturer" on public.classes;
create policy "Classes are viewable by students in course and lecturer" on public.classes 
  for select using (
    exists (select 1 from public.course_enrollments where course_id = classes.course_id and student_id = auth.uid())
    or exists (select 1 from public.courses where id = classes.course_id and lecturer_id = auth.uid())
  );

drop policy if exists "Lecturers can manage classes for their courses" on public.classes;
create policy "Lecturers can manage classes for their courses" on public.classes 
  for all using (
    exists (select 1 from public.courses where id = course_id and lecturer_id = auth.uid())
  );

-- 5. ATTENDANCE RECORDS (No direct student insert)
create table if not exists public.attendance_records (
  id uuid default uuid_generate_v4() primary key,
  class_id uuid references public.classes(id) on delete cascade,
  student_id uuid references public.profiles(id) on delete cascade,
  status text check (status in ('present', 'absent', 'late')) default 'present',
  method text check (method in ('qr', 'manual')) default 'qr',
  timestamp timestamp with time zone default now() not null,
  unique(class_id, student_id)
);

-- Enable RLS on attendance
alter table public.attendance_records enable row level security;

-- Policies for Attendance
drop policy if exists "Students can view own attendance" on public.attendance_records;
create policy "Students can view own attendance" on public.attendance_records 
  for select using (auth.uid() = student_id);

drop policy if exists "Lecturers can manage attendance for their classes" on public.attendance_records;
create policy "Lecturers can manage attendance for their classes" on public.attendance_records 
  for all using (
    exists (
      select 1 from public.classes c
      join public.courses co on c.course_id = co.id
      where c.id = attendance_records.class_id and co.lecturer_id = auth.uid()
    )
  );

-- 6. LEAVES
create table if not exists public.leaves (
  id uuid default uuid_generate_v4() primary key,
  student_id uuid references public.profiles(id) on delete cascade,
  start_date date not null,
  end_date date not null,
  reason text,
  status text check (status in ('pending', 'approved', 'rejected')) default 'pending',
  created_at timestamp with time zone default now() not null
);

-- Enable RLS on leaves
alter table public.leaves enable row level security;

-- Policies for Leaves
drop policy if exists "Students view own leaves" on public.leaves;
create policy "Students view own leaves" on public.leaves 
  for select using (auth.uid() = student_id);

drop policy if exists "Students create leaves" on public.leaves;
create policy "Students create leaves" on public.leaves 
  for insert with check (auth.uid() = student_id);

drop policy if exists "Staff view all leaves" on public.leaves;
create policy "Staff view all leaves" on public.leaves 
  for select using (
    exists (
      select 1 from public.profiles
      where id = auth.uid()
      and role in ('lecturer', 'admin')
    )
  );

drop policy if exists "Staff update leave status" on public.leaves;
create policy "Staff update leave status" on public.leaves 
  for update using (
    exists (
      select 1 from public.profiles
      where id = auth.uid()
      and role in ('lecturer', 'admin')
    )
  );

-- 7. AUTH TRIGGER
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name', 
    coalesce(new.raw_user_meta_data->>'role', 'student')
  );
  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if exists, then create
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
