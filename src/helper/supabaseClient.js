import { createClient } from '@supabase/supabase-js'

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_URL')
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

// Database schema reference:
// User-Table: user_id, created_at, user_name, email_id
// File-Table: file_id, file_name, extension, updated_at, project_id, code_path
// Temp-Table: id, file_id, temporary_code, project_id
// Project-Table: project_id, project_name, owner_id, team_email, created_at, updated_at

export default supabase

/* SQL for creating tables - run this in Supabase SQL editor:

create table folders (
    id bigint primary key generated always as identity,
    name text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table files (
    id bigint primary key generated always as identity,
    folder_id bigint references folders(id),
    name text not null,
    language text not null,
    content text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table "Project-Table" (
    project_id uuid default uuid_generate_v4() primary key,
    project_name text not null,
    owner_id uuid references auth.users(id),
    team_email text,
    created_at timestamptz default now()
);

-- Add Row Level Security (RLS)
alter table "Project-Table" enable row level security;

-- Create policy to allow users to see their own projects
create policy "Users can view their own projects"
    on "Project-Table"
    for select
    using (auth.uid() = owner_id);

-- Create policy to allow users to insert their own projects
create policy "Users can create their own projects"
    on "Project-Table"
    for insert
    with check (auth.uid() = owner_id);
*/