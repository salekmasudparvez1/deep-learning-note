insert into public.users (email, name, password_hash, role)
values (
  'admin@admin.com',
  'Administrator',
  '$2a$12$P6b6mdgqcO1T7LFofTNQgO60CwZCILD5h2P8ywlwhLvGso3eEOZEa',
  'admin'
)
on conflict (email) do update
set
  name = 'Administrator',
  password_hash = excluded.password_hash,
  role = 'admin';

notify pgrst, 'reload schema';
