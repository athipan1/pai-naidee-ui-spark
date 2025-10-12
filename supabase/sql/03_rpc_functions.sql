--
-- RPC Functions
--

-- Function to get the count of places for each category.
-- This is more efficient than fetching all places on the client.
CREATE OR REPLACE FUNCTION public.get_category_counts()
RETURNS TABLE(category text, count bigint)
LANGUAGE sql
STABLE
AS $$
  SELECT
    p.category,
    count(p.id)
  FROM
    public.places AS p
  GROUP BY
    p.category
  ORDER BY
    p.category;
$$;

-- Grant execute permission to the function for anon and authenticated roles
GRANT EXECUTE ON FUNCTION public.get_category_counts() TO anon;
GRANT EXECUTE ON FUNCTION public.get_category_counts() TO authenticated;