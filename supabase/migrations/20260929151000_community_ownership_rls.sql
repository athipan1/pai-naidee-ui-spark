-- Community ownership hardening.
-- This migration is defensive because older deployments may not have all community tables yet.
-- Policies are created only when the expected table and user_id column exist.

DO $$
BEGIN
  IF to_regclass('public.posts') IS NOT NULL
     AND EXISTS (
       SELECT 1 FROM information_schema.columns
       WHERE table_schema = 'public' AND table_name = 'posts' AND column_name = 'user_id'
     ) THEN
    EXECUTE 'ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY';

    EXECUTE 'DROP POLICY IF EXISTS "posts_public_read" ON public.posts';
    EXECUTE 'DROP POLICY IF EXISTS "posts_owner_insert" ON public.posts';
    EXECUTE 'DROP POLICY IF EXISTS "posts_owner_update" ON public.posts';
    EXECUTE 'DROP POLICY IF EXISTS "posts_owner_delete" ON public.posts';

    EXECUTE 'CREATE POLICY "posts_public_read" ON public.posts FOR SELECT TO anon, authenticated USING (true)';
    EXECUTE 'CREATE POLICY "posts_owner_insert" ON public.posts FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id)';
    EXECUTE 'CREATE POLICY "posts_owner_update" ON public.posts FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id)';
    EXECUTE 'CREATE POLICY "posts_owner_delete" ON public.posts FOR DELETE TO authenticated USING ((SELECT auth.uid()) = user_id)';

    EXECUTE 'REVOKE INSERT, UPDATE, DELETE ON public.posts FROM anon';
    EXECUTE 'GRANT SELECT ON public.posts TO anon, authenticated';
    EXECUTE 'GRANT INSERT, UPDATE, DELETE ON public.posts TO authenticated';
  END IF;
END
$$;

DO $$
BEGIN
  IF to_regclass('public.comments') IS NOT NULL
     AND EXISTS (
       SELECT 1 FROM information_schema.columns
       WHERE table_schema = 'public' AND table_name = 'comments' AND column_name = 'user_id'
     ) THEN
    EXECUTE 'ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY';

    EXECUTE 'DROP POLICY IF EXISTS "comments_public_read" ON public.comments';
    EXECUTE 'DROP POLICY IF EXISTS "comments_owner_insert" ON public.comments';
    EXECUTE 'DROP POLICY IF EXISTS "comments_owner_update" ON public.comments';
    EXECUTE 'DROP POLICY IF EXISTS "comments_owner_delete" ON public.comments';

    EXECUTE 'CREATE POLICY "comments_public_read" ON public.comments FOR SELECT TO anon, authenticated USING (true)';
    EXECUTE 'CREATE POLICY "comments_owner_insert" ON public.comments FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id)';
    EXECUTE 'CREATE POLICY "comments_owner_update" ON public.comments FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id)';
    EXECUTE 'CREATE POLICY "comments_owner_delete" ON public.comments FOR DELETE TO authenticated USING ((SELECT auth.uid()) = user_id)';

    EXECUTE 'REVOKE INSERT, UPDATE, DELETE ON public.comments FROM anon';
    EXECUTE 'GRANT SELECT ON public.comments TO anon, authenticated';
    EXECUTE 'GRANT INSERT, UPDATE, DELETE ON public.comments TO authenticated';
  END IF;
END
$$;

DO $$
BEGIN
  IF to_regclass('public.likes') IS NOT NULL
     AND EXISTS (
       SELECT 1 FROM information_schema.columns
       WHERE table_schema = 'public' AND table_name = 'likes' AND column_name = 'user_id'
     ) THEN
    EXECUTE 'ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY';

    EXECUTE 'DROP POLICY IF EXISTS "likes_public_read" ON public.likes';
    EXECUTE 'DROP POLICY IF EXISTS "likes_owner_insert" ON public.likes';
    EXECUTE 'DROP POLICY IF EXISTS "likes_owner_delete" ON public.likes';

    EXECUTE 'CREATE POLICY "likes_public_read" ON public.likes FOR SELECT TO anon, authenticated USING (true)';
    EXECUTE 'CREATE POLICY "likes_owner_insert" ON public.likes FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id)';
    EXECUTE 'CREATE POLICY "likes_owner_delete" ON public.likes FOR DELETE TO authenticated USING ((SELECT auth.uid()) = user_id)';

    EXECUTE 'REVOKE INSERT, UPDATE, DELETE ON public.likes FROM anon';
    EXECUTE 'GRANT SELECT ON public.likes TO anon, authenticated';
    EXECUTE 'GRANT INSERT, DELETE ON public.likes TO authenticated';
  END IF;
END
$$;
