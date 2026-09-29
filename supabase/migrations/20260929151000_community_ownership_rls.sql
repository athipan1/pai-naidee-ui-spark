-- Community ownership and privacy hardening.
-- Defensive by design: older deployments may not have all community tables/columns.
-- Authorization never trusts browser-supplied user IDs.

DO $$
DECLARE
  has_privacy boolean;
BEGIN
  IF to_regclass('public.posts') IS NOT NULL
     AND EXISTS (
       SELECT 1 FROM information_schema.columns
       WHERE table_schema = 'public' AND table_name = 'posts' AND column_name = 'user_id'
     ) THEN
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'posts' AND column_name = 'privacy'
    ) INTO has_privacy;

    EXECUTE 'ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY';

    EXECUTE 'DROP POLICY IF EXISTS "posts_public_read" ON public.posts';
    EXECUTE 'DROP POLICY IF EXISTS "posts_authenticated_read" ON public.posts';
    EXECUTE 'DROP POLICY IF EXISTS "posts_owner_insert" ON public.posts';
    EXECUTE 'DROP POLICY IF EXISTS "posts_owner_update" ON public.posts';
    EXECUTE 'DROP POLICY IF EXISTS "posts_owner_delete" ON public.posts';

    IF has_privacy THEN
      -- Friends-only posts intentionally fail closed until a real friend graph exists.
      EXECUTE 'CREATE POLICY "posts_public_read" ON public.posts FOR SELECT TO anon USING (privacy = ''public'')';
      EXECUTE 'CREATE POLICY "posts_authenticated_read" ON public.posts FOR SELECT TO authenticated USING (privacy = ''public'' OR (SELECT auth.uid()) = user_id)';
      EXECUTE 'CREATE POLICY "posts_owner_insert" ON public.posts FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id AND privacy IN (''public'', ''friends'', ''private''))';
      EXECUTE 'CREATE POLICY "posts_owner_update" ON public.posts FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id AND privacy IN (''public'', ''friends'', ''private''))';
    ELSE
      EXECUTE 'CREATE POLICY "posts_public_read" ON public.posts FOR SELECT TO anon, authenticated USING (true)';
      EXECUTE 'CREATE POLICY "posts_owner_insert" ON public.posts FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id)';
      EXECUTE 'CREATE POLICY "posts_owner_update" ON public.posts FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id)';
    END IF;

    EXECUTE 'CREATE POLICY "posts_owner_delete" ON public.posts FOR DELETE TO authenticated USING ((SELECT auth.uid()) = user_id)';

    EXECUTE 'REVOKE INSERT, UPDATE, DELETE ON public.posts FROM anon';
    EXECUTE 'GRANT SELECT ON public.posts TO anon, authenticated';
    EXECUTE 'GRANT INSERT, UPDATE, DELETE ON public.posts TO authenticated';
  END IF;
END
$$;

DO $$
DECLARE
  can_check_parent_privacy boolean;
BEGIN
  IF to_regclass('public.comments') IS NOT NULL
     AND EXISTS (
       SELECT 1 FROM information_schema.columns
       WHERE table_schema = 'public' AND table_name = 'comments' AND column_name = 'user_id'
     ) THEN
    SELECT
      to_regclass('public.posts') IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'comments' AND column_name = 'post_id'
      )
      AND EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'posts' AND column_name = 'id'
      )
      AND EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'posts' AND column_name = 'user_id'
      )
      AND EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'posts' AND column_name = 'privacy'
      )
    INTO can_check_parent_privacy;

    EXECUTE 'ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY';

    EXECUTE 'DROP POLICY IF EXISTS "comments_public_read" ON public.comments';
    EXECUTE 'DROP POLICY IF EXISTS "comments_authenticated_read" ON public.comments';
    EXECUTE 'DROP POLICY IF EXISTS "comments_owner_insert" ON public.comments';
    EXECUTE 'DROP POLICY IF EXISTS "comments_owner_update" ON public.comments';
    EXECUTE 'DROP POLICY IF EXISTS "comments_owner_delete" ON public.comments';

    IF can_check_parent_privacy THEN
      EXECUTE 'CREATE POLICY "comments_public_read" ON public.comments FOR SELECT TO anon USING (EXISTS (SELECT 1 FROM public.posts p WHERE p.id = post_id AND p.privacy = ''public''))';
      EXECUTE 'CREATE POLICY "comments_authenticated_read" ON public.comments FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id OR EXISTS (SELECT 1 FROM public.posts p WHERE p.id = post_id AND (p.privacy = ''public'' OR p.user_id = (SELECT auth.uid()))))';
      EXECUTE 'CREATE POLICY "comments_owner_insert" ON public.comments FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id AND EXISTS (SELECT 1 FROM public.posts p WHERE p.id = post_id AND (p.privacy = ''public'' OR p.user_id = (SELECT auth.uid()))))';
    ELSE
      EXECUTE 'CREATE POLICY "comments_public_read" ON public.comments FOR SELECT TO anon, authenticated USING (true)';
      EXECUTE 'CREATE POLICY "comments_owner_insert" ON public.comments FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id)';
    END IF;

    EXECUTE 'CREATE POLICY "comments_owner_update" ON public.comments FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id)';
    EXECUTE 'CREATE POLICY "comments_owner_delete" ON public.comments FOR DELETE TO authenticated USING ((SELECT auth.uid()) = user_id)';

    EXECUTE 'REVOKE INSERT, UPDATE, DELETE ON public.comments FROM anon';
    EXECUTE 'GRANT SELECT ON public.comments TO anon, authenticated';
    EXECUTE 'GRANT INSERT, UPDATE, DELETE ON public.comments TO authenticated';
  END IF;
END
$$;

DO $$
DECLARE
  can_check_parent_privacy boolean;
BEGIN
  IF to_regclass('public.likes') IS NOT NULL
     AND EXISTS (
       SELECT 1 FROM information_schema.columns
       WHERE table_schema = 'public' AND table_name = 'likes' AND column_name = 'user_id'
     ) THEN
    SELECT
      to_regclass('public.posts') IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'likes' AND column_name = 'post_id'
      )
      AND EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'posts' AND column_name = 'id'
      )
      AND EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'posts' AND column_name = 'user_id'
      )
      AND EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'posts' AND column_name = 'privacy'
      )
    INTO can_check_parent_privacy;

    EXECUTE 'ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY';

    EXECUTE 'DROP POLICY IF EXISTS "likes_owner_read" ON public.likes';
    EXECUTE 'DROP POLICY IF EXISTS "likes_owner_insert" ON public.likes';
    EXECUTE 'DROP POLICY IF EXISTS "likes_owner_delete" ON public.likes';
    EXECUTE 'DROP POLICY IF EXISTS "likes_public_read" ON public.likes';

    -- Like rows reveal user-to-content relationships, so do not expose them anonymously.
    EXECUTE 'CREATE POLICY "likes_owner_read" ON public.likes FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id)';

    IF can_check_parent_privacy THEN
      EXECUTE 'CREATE POLICY "likes_owner_insert" ON public.likes FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id AND EXISTS (SELECT 1 FROM public.posts p WHERE p.id = post_id AND (p.privacy = ''public'' OR p.user_id = (SELECT auth.uid()))))';
    ELSE
      EXECUTE 'CREATE POLICY "likes_owner_insert" ON public.likes FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id)';
    END IF;

    EXECUTE 'CREATE POLICY "likes_owner_delete" ON public.likes FOR DELETE TO authenticated USING ((SELECT auth.uid()) = user_id)';

    EXECUTE 'REVOKE SELECT, INSERT, UPDATE, DELETE ON public.likes FROM anon';
    EXECUTE 'GRANT SELECT, INSERT, DELETE ON public.likes TO authenticated';
  END IF;
END
$$;
