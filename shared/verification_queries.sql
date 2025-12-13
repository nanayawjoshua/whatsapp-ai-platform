-- ============================================================================
-- VERIFICATION QUERIES FOR BEELINE SUPABASE SCHEMA
-- Run these queries after importing shared/supabase-schema.sql
-- ============================================================================

-- ============================================================================
-- 1. BASIC TABLE VERIFICATION
-- ============================================================================

-- Count all tables in public schema
SELECT
    COUNT(*) as total_tables,
    STRING_AGG(table_name, ', ' ORDER BY table_name) as table_names
FROM information_schema.tables
WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE';

-- Detailed table information
SELECT
    schemaname,
    tablename,
    tableowner,
    tablespace,
    hasindexes,
    hasrules,
    hastriggers,
    rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- ============================================================================
-- 2. COLUMN VERIFICATION
-- ============================================================================

-- Vendors table columns
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns
WHERE table_name = 'vendors' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Products table columns
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'products' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Transactions table columns
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'transactions' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Messages table columns
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'messages' AND table_schema = 'public'
ORDER BY ordinal_position;

-- ============================================================================
-- 3. CONSTRAINTS AND INDEXES
-- ============================================================================

-- Check primary keys
SELECT
    tc.table_schema,
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
WHERE tc.constraint_type = 'PRIMARY KEY'
    AND tc.table_schema = 'public'
ORDER BY tc.table_name;

-- Check foreign keys
SELECT
    tc.table_schema,
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_schema AS foreign_table_schema,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
ORDER BY tc.table_name;

-- Check indexes
SELECT
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- ============================================================================
-- 4. RLS POLICIES VERIFICATION
-- ============================================================================

-- Check RLS status on tables
SELECT
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
    AND tablename IN ('vendors', 'products', 'transactions', 'messages')
ORDER BY tablename;

-- List all RLS policies
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ============================================================================
-- 5. FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Check functions
SELECT
    n.nspname as schema_name,
    p.proname as function_name,
    pg_get_function_identity_arguments(p.oid) as arguments,
    obj_description(p.oid, 'pg_proc') as description
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
ORDER BY p.proname;

-- Check triggers
SELECT
    event_object_schema,
    event_object_table,
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- ============================================================================
-- 6. VIEWS VERIFICATION
-- ============================================================================

-- Check views exist
SELECT
    table_schema,
    table_name,
    view_definition
FROM information_schema.views
WHERE table_schema = 'public'
    AND table_name IN ('vendor_dashboard', 'admin_dashboard')
ORDER BY table_name;

-- ============================================================================
-- 7. SAMPLE DATA TESTS
-- ============================================================================

-- Test vendor dashboard view (should return 0 rows)
SELECT * FROM vendor_dashboard LIMIT 5;

-- Test admin dashboard view (should return 0 rows)
SELECT * FROM admin_dashboard LIMIT 5;

-- Test calculate_vendor_score function
SELECT calculate_vendor_score('00000000-0000-0000-0000-000000000000'::uuid);

-- ============================================================================
-- 8. STORAGE BUCKET CHECK
-- ============================================================================

-- Check storage buckets (requires superuser, may not work in Supabase)
-- This is checked manually in the Supabase dashboard
-- Bucket name: product-images
-- Should be private, max file size configurable

-- ============================================================================
-- SUMMARY REPORT
-- ============================================================================

-- Generate summary report
SELECT
    'Database Verification Complete' as status,
    CURRENT_TIMESTAMP as verification_time,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE') as tables_created,
    (SELECT COUNT(*) FROM information_schema.views WHERE table_schema = 'public') as views_created,
    (SELECT COUNT(*) FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid WHERE n.nspname = 'public') as functions_created,
    (SELECT COUNT(*) FROM information_schema.triggers WHERE event_object_schema = 'public') as triggers_created;