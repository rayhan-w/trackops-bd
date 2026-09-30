const { Pool } = require('pg');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

let pool = null;
let isConnected = false;
let isFallbackMode = false;

// In-memory fallback store for local development / testing without active PostgreSQL server
const memoryStore = {
  users: new Map(),
  links: new Map(),
  link_visits: new Map(),
  consent_records: new Map(),
  notifications: new Map(),
  audit_logs: new Map(),
  telecom_integrations: new Map(),
};

const getPostgresUrl = () => {
  return (
    process.env.POSTGRES_URL ||
    process.env.DATABASE_URL ||
    process.env.POSTGRESQL_URI ||
    process.env.PG_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    ''
  );
};

const initSchema = async (client) => {
  const schemaSql = `
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(64) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE,
      phone VARCHAR(50),
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(50) DEFAULT 'USER',
      status VARCHAR(50) DEFAULT 'PENDING',
      approved_by VARCHAR(64),
      approved_at TIMESTAMPTZ,
      rejection_reason TEXT,
      suspension_reason TEXT,
      notification_preferences JSONB DEFAULT '{"emailAlerts": true, "linkClicks": true, "systemUpdates": true}'::jsonb,
      data JSONB DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS links (
      id VARCHAR(64) PRIMARY KEY,
      owner_id VARCHAR(64) NOT NULL,
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
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS link_visits (
      id VARCHAR(64) PRIMARY KEY,
      link_id VARCHAR(64) NOT NULL,
      owner_id VARCHAR(64) NOT NULL,
      visitor_reference_id VARCHAR(100) NOT NULL,
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
      timestamp TIMESTAMPTZ DEFAULT NOW(),
      visit_timestamp TIMESTAMPTZ DEFAULT NOW(),
      consent_timestamp TIMESTAMPTZ DEFAULT NOW(),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS consent_records (
      id VARCHAR(64) PRIMARY KEY,
      link_id VARCHAR(64) NOT NULL,
      visitor_session_id VARCHAR(100) NOT NULL,
      consent_status VARCHAR(50) NOT NULL,
      permission_type VARCHAR(50) NOT NULL,
      location_granted BOOLEAN DEFAULT FALSE,
      camera_granted BOOLEAN DEFAULT FALSE,
      browser_info_granted BOOLEAN DEFAULT FALSE,
      notice_acknowledged BOOLEAN DEFAULT TRUE,
      anonymized_ip VARCHAR(100),
      user_agent TEXT,
      timestamp TIMESTAMPTZ DEFAULT NOW(),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id VARCHAR(64) PRIMARY KEY,
      user_id VARCHAR(64) NOT NULL,
      title VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      type VARCHAR(50) DEFAULT 'SYSTEM_UPDATE',
      metadata JSONB DEFAULT '{}'::jsonb,
      is_read BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id VARCHAR(64) PRIMARY KEY,
      performed_by VARCHAR(64),
      performed_by_name VARCHAR(255) DEFAULT 'SYSTEM',
      action VARCHAR(100) NOT NULL,
      target_type VARCHAR(50) NOT NULL,
      target_id VARCHAR(100),
      details JSONB DEFAULT '{}'::jsonb,
      ip_address VARCHAR(100),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

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
  `;
  await client.query(schemaSql);
};

const seedDefaultAccounts = async (client) => {
  try {
    const res = await client.query('SELECT COUNT(*) as count FROM users');
    if (parseInt(res.rows[0].count, 10) === 0) {
      console.log('[PostgreSQL] Seeding initial demo accounts...');
      const salt = await bcrypt.genSalt(10);
      const superAdminHash = await bcrypt.hash('DemoSuperAdmin@2026', salt);
      const adminHash = await bcrypt.hash('DemoAdmin@2026', salt);
      const officerHash = await bcrypt.hash('DemoOfficer@2026', salt);

      const superAdminId = crypto.randomBytes(12).toString('hex');
      const adminId = crypto.randomBytes(12).toString('hex');
      const officerId = crypto.randomBytes(12).toString('hex');

      await client.query(
        `INSERT INTO users (id, name, email, phone, password_hash, role, status, approved_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
        [superAdminId, 'Super Administrator (CID Chief)', 'superadmin@trackops.local', '+8801700000001', superAdminHash, 'SUPER_ADMIN', 'APPROVED']
      );

      await client.query(
        `INSERT INTO users (id, name, email, phone, password_hash, role, status, approved_by, approved_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
        [adminId, 'Inspector Admin Rahman', 'admin@trackops.local', '+8801700000002', adminHash, 'ADMIN', 'APPROVED', superAdminId]
      );

      await client.query(
        `INSERT INTO users (id, name, email, phone, password_hash, role, status, approved_by, approved_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
        [officerId, 'Sub-Inspector Tanvir Ahmed', 'officer@trackops.local', '+8801819000003', officerHash, 'USER', 'APPROVED', adminId]
      );
      console.log('[PostgreSQL] Initial demo accounts created successfully.');
    }
  } catch (err) {
    console.warn('[PostgreSQL Seed Warning]:', err.message);
  }
};

const seedMemoryStore = async () => {
  if (memoryStore.users.size === 0) {
    const salt = await bcrypt.genSalt(10);
    const superAdminHash = await bcrypt.hash('DemoSuperAdmin@2026', salt);
    const adminHash = await bcrypt.hash('DemoAdmin@2026', salt);
    const officerHash = await bcrypt.hash('DemoOfficer@2026', salt);

    const superAdminId = '6abd07ab9eee42623f53b401';
    const adminId = '6abd07ab9eee42623f53b402';
    const officerId = '6abd07ab9eee42623f53b403';

    memoryStore.users.set(superAdminId, {
      id: superAdminId,
      _id: superAdminId,
      name: 'Super Administrator (CID Chief)',
      email: 'superadmin@trackops.local',
      phone: '+8801700000001',
      passwordHash: superAdminHash,
      role: 'SUPER_ADMIN',
      status: 'APPROVED',
      approvedAt: new Date(),
      notificationPreferences: { emailAlerts: true, linkClicks: true, systemUpdates: true },
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    memoryStore.users.set(adminId, {
      id: adminId,
      _id: adminId,
      name: 'Inspector Admin Rahman',
      email: 'admin@trackops.local',
      phone: '+8801700000002',
      passwordHash: adminHash,
      role: 'ADMIN',
      status: 'APPROVED',
      approvedBy: superAdminId,
      approvedAt: new Date(),
      notificationPreferences: { emailAlerts: true, linkClicks: true, systemUpdates: true },
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    memoryStore.users.set(officerId, {
      id: officerId,
      _id: officerId,
      name: 'Sub-Inspector Tanvir Ahmed',
      email: 'officer@trackops.local',
      phone: '+8801819000003',
      passwordHash: officerHash,
      role: 'USER',
      status: 'APPROVED',
      approvedBy: adminId,
      approvedAt: new Date(),
      notificationPreferences: { emailAlerts: true, linkClicks: true, systemUpdates: true },
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
};

const connectDB = async () => {
  if (isConnected && pool) {
    return pool;
  }

  const connectionString = getPostgresUrl();

  if (connectionString) {
    try {
      const isSslNeeded = connectionString.includes('vercel-storage.com') ||
                          connectionString.includes('neon.tech') ||
                          connectionString.includes('supabase.co') ||
                          connectionString.includes('sslmode=require');

      pool = new Pool({
        connectionString,
        ssl: isSslNeeded ? { rejectUnauthorized: false } : false,
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
      });

      const client = await pool.connect();
      await initSchema(client);
      await seedDefaultAccounts(client);
      client.release();

      isConnected = true;
      isFallbackMode = false;
      console.log('[PostgreSQL] Connected successfully to PostgreSQL database & schema initialized.');
      return pool;
    } catch (error) {
      console.error('[PostgreSQL Connection Error]:', error.message);
      if (process.env.NODE_ENV === 'production') {
        throw error;
      }
      console.warn('[PostgreSQL] Falling back to local memory adapter for development/testing.');
      isFallbackMode = true;
      isConnected = true;
      await seedMemoryStore();
      return null;
    }
  } else {
    // Development fallback
    isFallbackMode = true;
    isConnected = true;
    await seedMemoryStore();
    return null;
  }
};

module.exports = {
  connectDB,
  getPool: () => pool,
  isFallback: () => isFallbackMode,
  memoryStore,
};
