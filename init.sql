create table if not exists public.profiles (
  id uuid not null references auth.users(id) on delete cascade,
  username text,
  full_name text,
  avatar_url text,
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  primary key (id)
);

alter table public.profiles enable row level security;

create policy if not exists "Profiles are viewable by everyone" on public.profiles
  for select using (true);

create policy if not exists "Insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

create policy if not exists "Update own profile" on public.profiles
  for update using (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles(id)
  values(new.id)
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();