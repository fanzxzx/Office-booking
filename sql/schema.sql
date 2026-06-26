-- Run this in Supabase → SQL Editor → New query → Run

create table if not exists rooms (
  id text primary key,
  name text not null
);
insert into rooms (id, name) values
  ('room-a', 'Boardroom'),
  ('room-b', 'Huddle room')
on conflict (id) do nothing;

create table if not exists room_bookings (
  id uuid primary key default gen_random_uuid(),
  room_id text references rooms(id) not null,
  date date not null,
  start_min int not null,
  end_min int not null,
  name text not null,
  email text not null,
  purpose text not null,
  reminded boolean default false,
  created_at timestamptz default now()
);

create table if not exists equipment_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  qty int not null default 1
);
insert into equipment_items (name, qty) values
  ('Presentation clicker', 3),
  ('Wireless mic', 2),
  ('Bluetooth speaker', 1)
on conflict do nothing;

create table if not exists equipment_bookings (
  id uuid primary key default gen_random_uuid(),
  item_id uuid references equipment_items(id) not null,
  date date not null,
  name text not null,
  email text not null,
  purpose text not null,
  created_at timestamptz default now()
);

-- Row level security: allow anyone with the anon key to read/write.
-- Fine for a trusted internal tool behind a private link; tighten later if needed.
alter table room_bookings enable row level security;
alter table equipment_items enable row level security;
alter table equipment_bookings enable row level security;

create policy "anon full access" on room_bookings for all using (true) with check (true);
create policy "anon full access" on equipment_items for all using (true) with check (true);
create policy "anon full access" on equipment_bookings for all using (true) with check (true);
