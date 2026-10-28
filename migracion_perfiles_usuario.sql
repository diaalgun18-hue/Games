-- ====== Perfiles personales de usuario ======
-- Cada usuario con cuenta guarda acá SUS estados (para jugar / en curso / jugado),
-- SUS categorías y SUS nombres de disco. No toca discos ni juegos originales.
-- Correr una vez en Supabase → SQL Editor. Es seguro volver a correrlo.

create table if not exists perfiles_usuario (
  user_id uuid primary key references auth.users(id) on delete cascade,
  usuario text,
  datos jsonb not null default '{}'::jsonb,
  actualizado_en timestamptz not null default now(),
  constraint perfiles_usuario_tamano check (octet_length(datos::text) < 262144)
);

alter table perfiles_usuario enable row level security;

drop policy if exists "perfil propio - leer" on perfiles_usuario;
drop policy if exists "perfil propio - crear" on perfiles_usuario;
drop policy if exists "perfil propio - actualizar" on perfiles_usuario;
drop policy if exists "perfil propio - borrar" on perfiles_usuario;

create policy "perfil propio - leer" on perfiles_usuario for select using (auth.uid() = user_id);
create policy "perfil propio - crear" on perfiles_usuario for insert with check (auth.uid() = user_id);
create policy "perfil propio - actualizar" on perfiles_usuario for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "perfil propio - borrar" on perfiles_usuario for delete using (auth.uid() = user_id);
