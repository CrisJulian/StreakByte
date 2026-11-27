-- Persist per-lesson checked sections across devices on existing RLS-protected user_profiles table
alter table public.user_profiles
  add column if not exists completed_sections jsonb not null default '{}'::jsonb;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'user_profiles_completed_sections_is_object'
  ) then
    alter table public.user_profiles
      add constraint user_profiles_completed_sections_is_object
      check (jsonb_typeof(completed_sections) = 'object');
  end if;
end $$;
