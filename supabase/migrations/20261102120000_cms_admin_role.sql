-- Admin: everything a Super Admin (role 'owner') can do except Super Admin accounts, tracking
-- code and page scripts, and the two-step sign-in requirement (enforced in src/lib/cms/auth.ts).
alter table cms.cms_users drop constraint if exists cms_users_role_check;
alter table cms.cms_users add constraint cms_users_role_check
  check (role in ('owner', 'admin', 'seo', 'writer', 'viewer'));
