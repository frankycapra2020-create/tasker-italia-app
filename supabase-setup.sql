-- ============================================================
-- ProntoTecnico — Setup Database Supabase
-- Esegui questo script nell'SQL Editor di Supabase:
-- https://supabase.com/dashboard → SQL Editor → New Query
--
-- IMPORTANTE: Prima di usare l'app, vai in:
-- Authentication → Settings → "Enable email confirmations" = OFF
-- (l'app gestisce la verifica email con codice OTP proprio)
-- ============================================================

-- ── 1. Tabella profiles (estende auth.users) ────────────────
create table if not exists public.profiles (
  id              uuid references auth.users(id) on delete cascade primary key,
  nome            text        not null default '',
  cognome         text        not null default '',
  email           text        not null default '',
  ruolo           text        not null default 'cliente',
  specializzazione text,
  specializzazioni text[],
  certificazioni  text,
  zona            text,
  bio             text,
  foto            text,
  anni_esperienza int         default 0,
  raggio_operativo int        default 100,
  tariffe         jsonb,
  disponibilita   jsonb,
  disponibile_ora boolean     default true,
  attivo          boolean     default true,
  created_at      timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_all"  on public.profiles for select using (true);
create policy "profiles_insert_own"  on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own"  on public.profiles for update using (auth.uid() = id);

-- Trigger: crea il profilo automaticamente alla registrazione
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, nome, cognome, email, ruolo, specializzazione, certificazioni, zona)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nome', ''),
    coalesce(new.raw_user_meta_data->>'cognome', ''),
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'ruolo', 'cliente'),
    new.raw_user_meta_data->>'specializzazione',
    new.raw_user_meta_data->>'certificazioni',
    new.raw_user_meta_data->>'zona'
  );
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── 2. Tabella prenotazioni ─────────────────────────────────
create table if not exists public.prenotazioni (
  id               text        primary key,
  tecnico_id       text        not null,
  cliente_id       uuid        references auth.users(id) on delete set null,
  cliente_nome     text,
  cliente_email    text,
  cliente_telefono text,
  servizio         text,
  descrizione      text,
  data_intervento  text,
  ora_intervento   text,
  indirizzo        text,
  stato            text        default 'in_attesa',
  confermata_da    uuid        references auth.users(id) on delete set null,
  created_at       timestamptz default now()
);

alter table public.prenotazioni enable row level security;

create policy "prenotazioni_select_all"   on public.prenotazioni for select using (true);
create policy "prenotazioni_insert_auth"  on public.prenotazioni for insert with check (auth.uid() is not null);
create policy "prenotazioni_update_auth"  on public.prenotazioni for update using (auth.uid() is not null);

-- ── 3. Tabella recensioni ───────────────────────────────────
create table if not exists public.recensioni (
  id           text        primary key,
  booking_id   text,
  tecnico_id   text        not null,
  cliente_id   uuid        references auth.users(id) on delete set null,
  cliente_nome text,
  stelle       int         check (stelle between 1 and 5),
  commento     text,
  servizio     text,
  tecnico_nome text,
  risposta     text,
  risposta_data timestamptz,
  created_at   timestamptz default now()
);

alter table public.recensioni enable row level security;

create policy "recensioni_select_all"  on public.recensioni for select using (true);
create policy "recensioni_insert_auth" on public.recensioni for insert with check (auth.uid() is not null);
create policy "recensioni_update_auth" on public.recensioni for update using (auth.uid() is not null);

-- ── 4. Tabella messaggi_chat ────────────────────────────────
create table if not exists public.messaggi_chat (
  id          text        primary key,
  booking_id  text        not null,
  sender_id   uuid        references auth.users(id) on delete set null,
  sender_nome text,
  text        text,
  type        text        default 'text',
  file_url    text,
  file_name   text,
  created_at  timestamptz default now()
);

alter table public.messaggi_chat enable row level security;

create policy "messaggi_select_all"  on public.messaggi_chat for select using (true);
create policy "messaggi_insert_auth" on public.messaggi_chat for insert with check (auth.uid() is not null);

-- ── Abilita Realtime sulle tabelle principali ───────────────
alter publication supabase_realtime add table public.prenotazioni;
alter publication supabase_realtime add table public.recensioni;
alter publication supabase_realtime add table public.messaggi_chat;
alter publication supabase_realtime add table public.profiles;
