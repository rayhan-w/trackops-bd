-- =============================================================================
-- TrackOps BD - PostgreSQL Database Schema & Initial Seed Script
-- Platform: Lawful Link Management & Intelligence Hub
-- Compatible with: PostgreSQL 12, 13, 14, 15, 16, Supabase, Neon, AWS RDS, Render
-- =============================================================================

-- Step 1: Ensure Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- Table 1: USERS (Officers, Admins, Super Administrators)
-- =============================================================================
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(50),
    password_hash VARCHAR(255),
    role VARCHAR(50) DEFAULT 'USER',
    status VARCHAR(50) DEFAULT 'PENDING',
    rank VARCHAR(100),
    posting VARCHAR(255),
    activation_date TIMESTAMPTZ DEFAULT NOW(),
    expiry_date TIMESTAMPTZ,
    allowed_device_limit INTEGER DEFAULT NULL,
    active_sessions JSONB DEFAULT '[]'::jsonb,
    approved_by VARCHAR(64),
    approved_at TIMESTAMPTZ,
    rejection_reason TEXT,
    suspension_reason TEXT,
    notification_preferences JSONB DEFAULT '{"emailAlerts": true, "linkClicks": true, "systemUpdates": true}'::jsonb,
    data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

-- =============================================================================
-- Table 2: LINKS (Investigation Case Redirection Links)
-- =============================================================================
CREATE TABLE IF NOT EXISTS links (
    id VARCHAR(64) PRIMARY KEY,
    owner_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    destination_url TEXT NOT NULL,
    short_code VARCHAR(100) UNIQUE NOT NULL,
    domain VARCHAR(100) DEFAULT 'trackops.link',
    title VARCHAR(255) DEFAULT 'Untitled Link',
    description TEXT DEFAULT '',
    case_reference VARCHAR(100) DEFAULT 'CASE-GENERAL',
    status VARCHAR(50) DEFAULT 'ACTIVE',
    expiration_date TIMESTAMPTZ,
    requires_consent_notice BOOLEAN DEFAULT TRUE,
    clicks INTEGER DEFAULT 0,
    unique_visits INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}'::jsonb,
    data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_links_short_code ON links(short_code);
CREATE INDEX IF NOT EXISTS idx_links_owner_id ON links(owner_id);
CREATE INDEX IF NOT EXISTS idx_links_status ON links(status);

-- =============================================================================
-- Table 3: LINK_VISITS (Captured Telemetry & Consent Records)
-- =============================================================================
CREATE TABLE IF NOT EXISTS link_visits (
    id VARCHAR(64) PRIMARY KEY,
    link_id VARCHAR(64) REFERENCES links(id) ON DELETE CASCADE,
    owner_id VARCHAR(64),
    visitor_reference_id VARCHAR(100),
    consent_record_id VARCHAR(64),
    consent_status VARCHAR(50) DEFAULT 'SKIPPED',
    location_consent_status VARCHAR(50) DEFAULT 'Not Requested',
    camera_consent_status VARCHAR(50) DEFAULT 'Not Requested',
    camera_status VARCHAR(50) DEFAULT 'Unavailable',
    voluntarily_shared_location BOOLEAN DEFAULT FALSE,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    accuracy DOUBLE PRECISION,
    voluntarily_shared_camera BOOLEAN DEFAULT FALSE,
    camera_snapshot TEXT,
    browser_info_shared BOOLEAN DEFAULT FALSE,
    browser_info JSONB DEFAULT '{}'::jsonb,
    visitor_session_id VARCHAR(100),
    ip_hash VARCHAR(100),
    ip_address VARCHAR(100) DEFAULT '103.199.109.91',
    ipv4 VARCHAR(100) DEFAULT '103.199.109.91',
    ipv6 VARCHAR(100) DEFAULT 'N/A',
    internal_ip VARCHAR(100) DEFAULT '::ffff:10.0.1.6',
    referrer TEXT DEFAULT 'https://protidinernews.xyz/',
    location_source VARCHAR(100) DEFAULT 'IP (approximate)',
    ip_intelligence JSONB DEFAULT '{}'::jsonb,
    data JSONB DEFAULT '{}'::jsonb,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    visit_timestamp TIMESTAMPTZ DEFAULT NOW(),
    consent_timestamp TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_link_visits_link_id ON link_visits(link_id);
CREATE INDEX IF NOT EXISTS idx_link_visits_owner_id ON link_visits(owner_id);
CREATE INDEX IF NOT EXISTS idx_link_visits_created_at ON link_visits(created_at);

-- =============================================================================
-- Table 4: CONSENT_RECORDS (Explicit Voluntary Authorization Logs)
-- =============================================================================
CREATE TABLE IF NOT EXISTS consent_records (
    id VARCHAR(64) PRIMARY KEY,
    link_id VARCHAR(64) REFERENCES links(id) ON DELETE CASCADE,
    visitor_session_id VARCHAR(100),
    consent_status VARCHAR(50),
    permission_type VARCHAR(50),
    location_granted BOOLEAN DEFAULT FALSE,
    camera_granted BOOLEAN DEFAULT FALSE,
    browser_info_granted BOOLEAN DEFAULT FALSE,
    notice_acknowledged BOOLEAN DEFAULT TRUE,
    anonymized_ip VARCHAR(100),
    user_agent TEXT,
    data JSONB DEFAULT '{}'::jsonb,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_consent_records_link_id ON consent_records(link_id);

-- =============================================================================
-- Table 5: NOTIFICATIONS (System & Investigation Activity Alerts)
-- =============================================================================
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255),
    message TEXT,
    type VARCHAR(50) DEFAULT 'SYSTEM_UPDATE',
    metadata JSONB DEFAULT '{}'::jsonb,
    data JSONB DEFAULT '{}'::jsonb,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);

-- =============================================================================
-- Table 6: AUDIT_LOGS (Immutable Administrative Action Trail)
-- =============================================================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(64) PRIMARY KEY,
    performed_by VARCHAR(64),
    performed_by_name VARCHAR(255) DEFAULT 'SYSTEM',
    action VARCHAR(100),
    target_type VARCHAR(50),
    target_id VARCHAR(100),
    details JSONB DEFAULT '{}'::jsonb,
    data JSONB DEFAULT '{}'::jsonb,
    ip_address VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- =============================================================================
-- Table 7: TELECOM_INTEGRATIONS (Warrant & Gateway Configuration)
-- =============================================================================
CREATE TABLE IF NOT EXISTS telecom_integrations (
    id VARCHAR(64) PRIMARY KEY,
    is_enabled BOOLEAN DEFAULT FALSE,
    provider_name VARCHAR(255) DEFAULT 'Bangladesh Telecommunication Regulatory Interface',
    api_endpoint TEXT DEFAULT '',
    api_key_masked VARCHAR(255) DEFAULT '',
    authorized_officer_role VARCHAR(50) DEFAULT 'SUPER_ADMIN',
    disclaimer TEXT,
    access_audit_logs JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- INITIAL SEED ACCOUNTS (Default Authorized Roster)
-- =============================================================================

-- 1. SUPER ADMIN (Email: superadmin@trackops.local | Password: DemoSuperAdmin@2026)
INSERT INTO users (
    id, name, email, phone, password_hash, role, status, rank, posting,
    allowed_device_limit, activation_date, expiry_date, active_sessions, approved_at, data
) VALUES (
    'usr_superadmin_001',
    'Super Administrator (CID Chief)',
    'superadmin@trackops.local',
    '+8801700000001',
    '$2a$10$rxk2IkTcw3k3JAN93gtAGu.8gjhSdE36lq/OO7siZ7FJElRDN10Y6',
    'SUPER_ADMIN',
    'APPROVED',
    'Superintendent of Police (SP)',
    'CID Cyber Police Centre, Dhaka',
    NULL,
    NOW(),
    NOW() + INTERVAL '365 days',
    '[]'::jsonb,
    NOW(),
    '{"isSeed": true}'::jsonb
) ON CONFLICT (email) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    role = EXCLUDED.role,
    status = EXCLUDED.status;

-- 2. ADMIN (Email: admin@trackops.local | Password: DemoAdmin@2026)
INSERT INTO users (
    id, name, email, phone, password_hash, role, status, rank, posting,
    allowed_device_limit, activation_date, expiry_date, active_sessions, approved_at, data
) VALUES (
    'usr_admin_002',
    'Inspector Admin Rahman',
    'admin@trackops.local',
    '+8801700000002',
    '$2a$10$DrRB1O2ERelkAQnKyh2TaunHDsAkJnFSFYaq/mF724MVc2nJM4SNy',
    'ADMIN',
    'APPROVED',
    'Inspector',
    'Detective Branch (DB), Dhaka Metro',
    NULL,
    NOW(),
    NOW() + INTERVAL '180 days',
    '[]'::jsonb,
    NOW(),
    '{"isSeed": true}'::jsonb
) ON CONFLICT (email) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    role = EXCLUDED.role,
    status = EXCLUDED.status;

-- 3. OFFICER (Email: officer@trackops.local | Password: DemoOfficer@2026)
INSERT INTO users (
    id, name, email, phone, password_hash, role, status, rank, posting,
    allowed_device_limit, activation_date, expiry_date, active_sessions, approved_at, data
) VALUES (
    'usr_officer_003',
    'Sub-Inspector Tanvir Ahmed',
    'officer@trackops.local',
    '+8801819000003',
    '$2a$10$n6oLvFWm0C.evDzG3ROxbOGsaaqga4/j5cVBAeAfPDcb4Ek6O2gha',
    'USER',
    'APPROVED',
    'Sub-Inspector (SI)',
    'DMP Cyber Crime Division',
    NULL,
    NOW(),
    NOW() + INTERVAL '90 days',
    '[]'::jsonb,
    NOW(),
    '{"isSeed": true}'::jsonb
) ON CONFLICT (email) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    role = EXCLUDED.role,
    status = EXCLUDED.status;

-- =============================================================================
-- INITIAL TELECOM GATEWAY ENTRY
-- =============================================================================
INSERT INTO telecom_integrations (
    id, is_enabled, provider_name, api_endpoint, api_key_masked, authorized_officer_role, disclaimer
) VALUES (
    'telecom_default_01',
    FALSE,
    'Bangladesh Telecommunication Regulatory Interface (Direct Gateway)',
    'https://gateway.telecom.gov.bd/api/v1/warrant-verify',
    '••••••••••••••••••••••••••••••••38f2',
    'SUPER_ADMIN',
    'Lawful intercept requires active Section 97A Code of Criminal Procedure warrant authorization.'
) ON CONFLICT (id) DO NOTHING;
