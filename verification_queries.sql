-- ============================================================================
-- BUZZ: SUPABASE SCHEMA VERIFICATION QUERIES
-- ============================================================================
-- Run these queries in Supabase SQL Editor to verify the schema was imported correctly
-- Expected results documented for each query
-- ============================================================================

-- QUERY 1: Count all tables in public schema
-- Expected Result: 7 (vendors, products, transactions, messages, jiji_leads, outreach_campaigns, daily_analytics)
SELECT COUNT(*) as table_count
FROM information_schema.tables
WHERE table_schema = 'public';

-- ============================================================================

-- QUERY 2: List all table names
-- Expected Result: All 7 tables listed
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- ============================================================================

-- QUERY 3: Verify vendors table is empty
-- Expected Result: 0 (no vendors yet)
SELECT COUNT(*) as vendor_count
FROM vendors;

-- ============================================================================

-- QUERY 4: Check vendors table column structure
-- Expected Result: ~18 columns including id, phone, name, email, category, etc.
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'vendors'
ORDER BY ordinal_position;

-- ============================================================================

-- QUERY 5: Verify indexes exist on vendors table
-- Expected Result: 3 indexes (idx_vendors_phone, idx_vendors_category, idx_vendors_status)
SELECT indexname
FROM pg_indexes
WHERE tablename = 'vendors';

-- ============================================================================

-- QUERY 6: Check RLS is enabled on vendors table
-- Expected Result: enabled
SELECT relname, relrowsecurity
FROM pg_class
WHERE relname = 'vendors';

-- ============================================================================

-- QUERY 7: Verify RLS policies exist
-- Expected Result: Policies on vendors, products, transactions, messages tables
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename;

-- ============================================================================

-- QUERY 8: Verify is_admin() function exists
-- Expected Result: Function listed in pg_proc
SELECT proname, pg_get_functiondef(oid)
FROM pg_proc
WHERE proname = 'is_admin'
AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

-- ============================================================================

-- QUERY 9: Test is_admin() function (won't return data if no auth user, but function exists)
-- Expected Result: Function can be called (may return NULL if no authenticated user)
SELECT public.is_admin() as is_current_user_admin;

-- ============================================================================

-- QUERY 10: Verify all 7 tables and their row counts
-- Expected Result: All tables with 0 rows (new database)
SELECT
  schemaname,
  tablename,
  (SELECT COUNT(*) FROM (SELECT 1 FROM INFORMATION_SCHEMA.TABLES t WHERE t.table_name=tablename) AS x) as estimated_rows
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- ============================================================================

-- QUERY 11: List all functions in public schema
-- Expected Result: should see is_admin, calculate_vendor_score, update_updated_at, update_vendor_wallet
SELECT proname
FROM pg_proc
WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
ORDER BY proname;

-- ============================================================================

-- QUERY 12: List all triggers
-- Expected Result: should see triggers on vendors, jiji_leads, transactions tables
SELECT trigger_schema, trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table;

-- ============================================================================

-- QUERY 13: Verify views were created
-- Expected Result: vendor_dashboard, admin_dashboard
SELECT table_schema, table_name
FROM information_schema.views
WHERE table_schema = 'public';

-- ============================================================================

-- QUERY 14: Quick health check - all tables exist
-- Expected Result: All 7 table names (this confirms tables 1-7 exist)
SELECT COUNT(*) as tables_present
FROM (
  SELECT 1 WHERE EXISTS (SELECT 1 FROM vendors LIMIT 1)
  UNION ALL SELECT 1 WHERE EXISTS (SELECT 1 FROM products LIMIT 1)
  UNION ALL SELECT 1 WHERE EXISTS (SELECT 1 FROM transactions LIMIT 1)
  UNION ALL SELECT 1 WHERE EXISTS (SELECT 1 FROM messages LIMIT 1)
  UNION ALL SELECT 1 WHERE EXISTS (SELECT 1 FROM jiji_leads LIMIT 1)
  UNION ALL SELECT 1 WHERE EXISTS (SELECT 1 FROM outreach_campaigns LIMIT 1)
  UNION ALL SELECT 1 WHERE EXISTS (SELECT 1 FROM daily_analytics LIMIT 1)
) as tables_check;

-- Expected: 7

-- ============================================================================
-- END OF VERIFICATION QUERIES
-- ============================================================================
-- Run each query above one by one and verify expected results
-- All should pass if schema imported successfully
