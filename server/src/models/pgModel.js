const crypto = require('crypto');
const { getPool, isFallback, memoryStore } = require('../config/db');

function createQueryChain(executeFn) {
  const state = {
    sort: null,
    skip: 0,
    limit: null,
    populates: [],
    selects: null,
  };

  const chain = {
    sort(s) {
      state.sort = s;
      return chain;
    },
    skip(n) {
      state.skip = Number(n) || 0;
      return chain;
    },
    limit(n) {
      state.limit = Number(n);
      return chain;
    },
    populate(field, select) {
      state.populates.push({ field, select });
      return chain;
    },
    select(s) {
      state.selects = s;
      return chain;
    },
    then(onFulfilled, onRejected) {
      return executeFn(state).then(onFulfilled, onRejected);
    },
    catch(onRejected) {
      return executeFn(state).catch(onRejected);
    },
  };

  return chain;
}

async function populateField(item, pop, pool) {
  if (!item) return;
  const refId = item[pop.field];
  if (!refId || typeof refId === 'object') return;

  let targetTable = null;
  if (pop.field === 'ownerId' || pop.field === 'userId' || pop.field === 'approvedBy' || pop.field === 'performedBy') {
    targetTable = 'users';
  } else if (pop.field === 'linkId') {
    targetTable = 'links';
  } else if (pop.field === 'consentRecordId') {
    targetTable = 'consent_records';
  }

  if (targetTable && pool && !isFallback()) {
    try {
      const q = await pool.query(`SELECT * FROM ${targetTable} WHERE id = $1`, [String(refId)]);
      if (q.rows.length > 0) {
        const r = q.rows[0];
        let d = {};
        try {
          d = typeof r.data === 'string' ? (r.data ? JSON.parse(r.data) : {}) : (r.data || {});
        } catch (_) { d = {}; }
        d.id = r.id || d.id;
        d._id = d.id;
        if (targetTable === 'users') {
          if (r.name != null) d.name = r.name;
          if (r.email != null) d.email = r.email;
          if (r.phone != null) d.phone = r.phone;
          if (r.role != null) d.role = r.role;
          if (r.status != null) d.status = r.status;
          if (r.rank != null) d.rank = r.rank;
          if (r.posting != null) { d.posting = r.posting; d.currentPosting = r.posting; }
          if (r.activation_date != null) d.activationDate = r.activation_date;
          if (r.expiry_date !== undefined) d.expiryDate = r.expiry_date;
          if (r.allowed_device_limit != null) d.allowedDeviceLimit = Number(r.allowed_device_limit);
        } else if (targetTable === 'links') {
          if (r.short_code != null) { d.shortCode = r.short_code; d.short_code = r.short_code; }
          if (r.destination_url != null) { d.destinationUrl = r.destination_url; d.destination_url = r.destination_url; }
          if (r.title != null) d.title = r.title;
          if (r.description != null) d.description = r.description;
          if (r.case_reference != null) { d.caseReference = r.case_reference; d.case_reference = r.case_reference; }
          if (r.status != null) d.status = r.status;
          if (r.domain != null) d.domain = r.domain;
        } else if (targetTable === 'consent_records') {
          if (r.consent_status != null) d.consentStatus = r.consent_status;
          if (r.permission_type != null) d.permissionType = r.permission_type;
        }
        item[pop.field] = decorateDoc(d, {}, null);
        return;
      }
    } catch (e) {
      console.error(`[Populate ${targetTable} Error]:`, e.message);
    }
  }

  if (targetTable) {
    const store = memoryStore[targetTable] || new Map();
    const obj = store.get(String(refId));
    if (obj) {
      item[pop.field] = decorateDoc(obj, {}, null);
    }
  }
}

function matchDoc(doc, query) {
  if (!query || Object.keys(query).length === 0) return true;

  for (const [key, value] of Object.entries(query)) {
    if (key === '$or' && Array.isArray(value)) {
      const orMatched = value.some((subQuery) => matchDoc(doc, subQuery));
      if (!orMatched) return false;
      continue;
    }

    let docVal = doc[key];
    if (docVal === undefined) {
      if (key === '_id' || key === 'id') docVal = doc.id || doc._id;
      else if (key === 'shortCode' || key === 'short_code') docVal = doc.shortCode || doc.short_code;
      else if (key === 'ownerId' || key === 'owner_id') docVal = doc.ownerId || doc.owner_id;
      else if (key === 'linkId' || key === 'link_id') docVal = doc.linkId || doc.link_id;
      else if (key === 'caseReference' || key === 'case_reference') docVal = doc.caseReference || doc.case_reference;
    }

    if (value instanceof RegExp) {
      if (!value.test(String(docVal || ''))) return false;
    } else if (value && typeof value === 'object' && value.$regex) {
      const re = new RegExp(value.$regex, value.$options || '');
      if (!re.test(String(docVal || ''))) return false;
    } else if (value && typeof value === 'object' && value.$in) {
      if (!value.$in.includes(docVal)) return false;
    } else if (value && typeof value === 'object' && value.$ne) {
      if (docVal === value.$ne) return false;
    } else {
      if (String(docVal) !== String(value)) {
        // Also check if id / _id matches
        if ((key === '_id' || key === 'id') && (doc.id === value || doc._id === value)) {
          continue;
        }
        return false;
      }
    }
  }

  return true;
}

function sortDocs(docs, sortSpec) {
  if (!sortSpec) return docs;
  let sortEntries = [];
  if (typeof sortSpec === 'string') {
    sortEntries = sortSpec.split(' ').map((f) => [f.replace(/^-/, ''), f.startsWith('-') ? -1 : 1]);
  } else if (typeof sortSpec === 'object') {
    sortEntries = Object.entries(sortSpec);
  }

  return docs.sort((a, b) => {
    for (const [field, direction] of sortEntries) {
      const valA = a[field] ?? '';
      const valB = b[field] ?? '';
      if (valA < valB) return direction === 1 || direction === 'asc' ? -1 : 1;
      if (valA > valB) return direction === 1 || direction === 'asc' ? 1 : -1;
    }
    return 0;
  });
}

function decorateDoc(doc, methods = {}, model = null) {
  if (!doc) return null;
  const wrapped = { ...doc };
  wrapped._id = wrapped.id || wrapped._id;
  wrapped.id = wrapped._id;

  wrapped.toObject = function () {
    const copy = { ...this };
    delete copy.save;
    delete copy.toObject;
    return copy;
  };

  for (const [name, fn] of Object.entries(methods)) {
    wrapped[name] = fn.bind(wrapped);
  }

  wrapped.save = async function () {
    if (model) {
      const updated = await model.findByIdAndUpdate(this.id, this);
      if (updated) {
        Object.assign(this, updated);
      }
    }
    return this;
  };

  return wrapped;
}

function createModel(tableName, methods = {}) {
  const storeKey = tableName;

  const model = {
    tableName,

    async create(data) {
      const pool = getPool();
      const id = data.id || data._id || crypto.randomBytes(12).toString('hex');
      const now = new Date();
      const doc = {
        ...data,
        id,
        _id: id,
        createdAt: data.createdAt || now,
        updatedAt: data.updatedAt || now,
      };

      if (pool && !isFallback()) {
        try {
          let res;
          if (tableName === 'links') {
            res = await pool.query(
              `INSERT INTO links (
                id, owner_id, destination_url, short_code, domain, title, description,
                case_reference, status, expiration_date, requires_consent_notice,
                clicks, unique_visits, metadata, data, created_at, updated_at
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
              ON CONFLICT (id) DO UPDATE SET
                owner_id = EXCLUDED.owner_id,
                destination_url = EXCLUDED.destination_url,
                short_code = EXCLUDED.short_code,
                domain = EXCLUDED.domain,
                title = EXCLUDED.title,
                description = EXCLUDED.description,
                case_reference = EXCLUDED.case_reference,
                status = EXCLUDED.status,
                expiration_date = EXCLUDED.expiration_date,
                requires_consent_notice = EXCLUDED.requires_consent_notice,
                clicks = EXCLUDED.clicks,
                unique_visits = EXCLUDED.unique_visits,
                metadata = EXCLUDED.metadata,
                data = EXCLUDED.data,
                updated_at = EXCLUDED.updated_at
              RETURNING *`,
              [
                id,
                doc.ownerId || doc.owner_id || null,
                doc.destinationUrl || doc.destination_url || '',
                doc.shortCode || doc.short_code || '',
                doc.domain || 'trackops.link',
                doc.title || 'Untitled Link',
                doc.description || '',
                doc.caseReference || doc.case_reference || 'CASE-GENERAL',
                doc.status || 'ACTIVE',
                doc.expirationDate ? new Date(doc.expirationDate) : null,
                doc.requiresConsentNotice !== undefined ? doc.requiresConsentNotice : true,
                Number(doc.clicks || 0),
                Number(doc.uniqueVisits || 0),
                JSON.stringify(doc.metadata || {}),
                JSON.stringify(doc),
                doc.createdAt,
                doc.updatedAt,
              ]
            );
          } else if (tableName === 'link_visits') {
            res = await pool.query(
              `INSERT INTO link_visits (
                id, link_id, owner_id, visitor_reference_id, consent_record_id, consent_status,
                location_consent_status, camera_consent_status, camera_status, voluntarily_shared_location,
                latitude, longitude, accuracy, voluntarily_shared_camera, camera_snapshot,
                browser_info_shared, browser_info, visitor_session_id, ip_hash, ip_address,
                ipv4, ipv6, internal_ip, referrer, location_source, ip_intelligence,
                data, timestamp, visit_timestamp, consent_timestamp, created_at, updated_at
              ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
                $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
                $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32
              )
              ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = EXCLUDED.updated_at
              RETURNING *`,
              [
                id,
                doc.linkId || doc.link_id || null,
                doc.ownerId || doc.owner_id || null,
                doc.visitorReferenceId || doc.visitor_reference_id || 'VIS-TEMP',
                doc.consentRecordId || doc.consent_record_id || null,
                doc.consentStatus || doc.consent_status || 'SKIPPED',
                doc.locationConsentStatus || 'Not Requested',
                doc.cameraConsentStatus || 'Not Requested',
                doc.cameraStatus || 'Unavailable',
                Boolean(doc.voluntarilySharedLocation),
                doc.latitude !== null && doc.latitude !== undefined ? Number(doc.latitude) : null,
                doc.longitude !== null && doc.longitude !== undefined ? Number(doc.longitude) : null,
                doc.accuracy !== null && doc.accuracy !== undefined ? Number(doc.accuracy) : null,
                Boolean(doc.voluntarilySharedCamera),
                doc.cameraSnapshot || null,
                Boolean(doc.browserInfoShared),
                JSON.stringify(doc.browserInfo || {}),
                doc.visitorSessionId || 'SESSION-TEMP',
                doc.ipHash || null,
                doc.ipAddress || '103.199.109.91',
                doc.ipv4 || '103.199.109.91',
                doc.ipv6 || 'N/A',
                doc.internalIp || '::ffff:10.0.1.6',
                doc.referrer || 'https://protidinernews.xyz/',
                doc.locationSource || 'IP (approximate)',
                JSON.stringify(doc.ipIntelligence || {}),
                JSON.stringify(doc),
                doc.timestamp || doc.createdAt,
                doc.visitTimestamp || doc.createdAt,
                doc.consentTimestamp || doc.createdAt,
                doc.createdAt,
                doc.updatedAt,
              ]
            );
          } else if (tableName === 'consent_records') {
            res = await pool.query(
              `INSERT INTO consent_records (
                id, link_id, visitor_session_id, consent_status, permission_type,
                location_granted, camera_granted, browser_info_granted, notice_acknowledged,
                anonymized_ip, user_agent, data, timestamp, created_at, updated_at
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
              ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = EXCLUDED.updated_at
              RETURNING *`,
              [
                id,
                doc.linkId || doc.link_id || null,
                doc.visitorSessionId || 'SESSION-TEMP',
                doc.consentStatus || 'SKIPPED',
                doc.permissionType || 'GENERAL_CONSENT',
                Boolean(doc.locationGranted),
                Boolean(doc.cameraGranted),
                Boolean(doc.browserInfoGranted),
                Boolean(doc.noticeAcknowledged !== false),
                doc.anonymizedIp || null,
                doc.userAgent || '',
                JSON.stringify(doc),
                doc.timestamp || doc.createdAt,
                doc.createdAt,
                doc.updatedAt,
              ]
            );
          } else if (tableName === 'notifications') {
            res = await pool.query(
              `INSERT INTO notifications (
                id, user_id, title, message, type, metadata, data, is_read, created_at, updated_at
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
              ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = EXCLUDED.updated_at
              RETURNING *`,
              [
                id,
                doc.userId || doc.user_id || null,
                doc.title || '',
                doc.message || '',
                doc.type || 'SYSTEM_UPDATE',
                JSON.stringify(doc.metadata || {}),
                JSON.stringify(doc),
                Boolean(doc.isRead),
                doc.createdAt,
                doc.updatedAt,
              ]
            );
          } else if (tableName === 'audit_logs') {
            res = await pool.query(
              `INSERT INTO audit_logs (
                id, performed_by, performed_by_name, action, target_type, target_id, details, data, ip_address, created_at, updated_at
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
              ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = EXCLUDED.updated_at
              RETURNING *`,
              [
                id,
                doc.performedBy || doc.performed_by || null,
                doc.performedByName || doc.performed_by_name || 'SYSTEM',
                doc.action || 'GENERAL_ACTION',
                doc.targetType || doc.target_type || 'SYSTEM',
                doc.targetId || doc.target_id || null,
                JSON.stringify(doc.details || {}),
                JSON.stringify(doc),
                doc.ipAddress || null,
                doc.createdAt,
                doc.updatedAt,
              ]
            );
          } else if (tableName === 'users') {
            res = await pool.query(
              `INSERT INTO users (
                id, name, email, phone, password_hash, role, status, approved_by, approved_at,
                rank, posting, activation_date, expiry_date, allowed_device_limit, active_sessions,
                notification_preferences, data, created_at, updated_at
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
              ON CONFLICT (email) DO UPDATE SET
                password_hash = EXCLUDED.password_hash,
                role = EXCLUDED.role,
                status = EXCLUDED.status,
                rank = EXCLUDED.rank,
                posting = EXCLUDED.posting,
                activation_date = EXCLUDED.activation_date,
                expiry_date = EXCLUDED.expiry_date,
                allowed_device_limit = EXCLUDED.allowed_device_limit,
                active_sessions = EXCLUDED.active_sessions,
                data = EXCLUDED.data,
                updated_at = EXCLUDED.updated_at
              RETURNING *`,
              [
                id,
                doc.name || '',
                doc.email || '',
                doc.phone || '',
                doc.passwordHash || doc.password_hash || '',
                doc.role || 'USER',
                doc.status || 'PENDING',
                doc.approvedBy || doc.approved_by || null,
                doc.approvedAt || null,
                doc.rank || null,
                doc.posting || doc.currentPosting || null,
                doc.activationDate ? new Date(doc.activationDate) : null,
                doc.expiryDate ? new Date(doc.expiryDate) : null,
                doc.allowedDeviceLimit != null ? Number(doc.allowedDeviceLimit) : 1,
                JSON.stringify(doc.activeSessions || []),
                JSON.stringify(doc.notificationPreferences || {}),
                JSON.stringify(doc),
                doc.createdAt,
                doc.updatedAt,
              ]
            );
          } else {
            res = await pool.query(
              `INSERT INTO ${tableName} (id, data, created_at, updated_at)
               VALUES ($1, $2, $3, $4)
               ON CONFLICT (id) DO UPDATE SET data = $2, updated_at = $4
               RETURNING *`,
              [id, JSON.stringify(doc), doc.createdAt, doc.updatedAt]
            );
          }

          const saved = (res && res.rows && res.rows[0] && res.rows[0].data) || doc;
          saved.id = (res && res.rows && res.rows[0] && res.rows[0].id) || id;
          saved._id = saved.id;
          return decorateDoc(saved, methods, model);
        } catch (err) {
          console.error(`[PG ${tableName} Create Error]:`, err.message);
        }
      }

      // Memory fallback
      const store = memoryStore[storeKey] || (memoryStore[storeKey] = new Map());
      store.set(id, doc);
      return decorateDoc(doc, methods, model);
    },

    find(query = {}) {
      return createQueryChain(async (state) => {
        let results = [];
        const pool = getPool();

        if (pool && !isFallback()) {
          try {
            const res = await pool.query(`SELECT * FROM ${tableName}`);
            results = res.rows.map((r) => {
              // Start with JSON blob as base, then override with real column values
              let d = {};
              try {
                d = typeof r.data === 'string' ? (r.data ? JSON.parse(r.data) : {}) : (r.data || {});
              } catch (e) { d = {}; }

              // Always override with actual column values (source of truth)
              d.id = r.id || d.id;
              d._id = d.id;

              if (r.name != null) d.name = r.name;
              if (r.email != null) d.email = r.email;
              if (r.phone != null) d.phone = r.phone;
              if (r.password_hash != null) d.passwordHash = r.password_hash;
              if (r.role != null) d.role = r.role;
              if (r.status != null) d.status = r.status;
              if (r.rank != null) d.rank = r.rank;
              if (r.posting != null) { d.posting = r.posting; d.currentPosting = r.posting; }
              if (r.activation_date != null) d.activationDate = r.activation_date;
              if (r.expiry_date !== undefined) d.expiryDate = r.expiry_date;
              if (r.allowed_device_limit != null) d.allowedDeviceLimit = Number(r.allowed_device_limit);
              if (r.active_sessions != null) {
                try {
                  d.activeSessions = typeof r.active_sessions === 'string' ? JSON.parse(r.active_sessions) : r.active_sessions;
                } catch (e) { d.activeSessions = []; }
              }
              if (r.short_code != null) { d.shortCode = r.short_code; d.short_code = r.short_code; }
              if (r.owner_id != null) { d.ownerId = r.owner_id; d.owner_id = r.owner_id; }
              if (r.destination_url != null) { d.destinationUrl = r.destination_url; d.destination_url = r.destination_url; }
              if (r.domain != null) d.domain = r.domain;
              if (r.title != null) d.title = r.title;
              if (r.description != null) d.description = r.description;
              if (r.case_reference != null) { d.caseReference = r.case_reference; d.case_reference = r.case_reference; }
              if (r.clicks != null) d.clicks = Number(r.clicks);
              if (r.unique_visits != null) d.uniqueVisits = Number(r.unique_visits);
              if (r.expiration_date !== undefined) d.expirationDate = r.expiration_date;
              if (r.requires_consent_notice != null) d.requiresConsentNotice = r.requires_consent_notice;
              if (r.link_id != null) { d.linkId = r.link_id; d.link_id = r.link_id; }
              if (r.user_id != null) { d.userId = r.user_id; d.user_id = r.user_id; }
              if (r.visitor_reference_id != null) d.visitorReferenceId = r.visitor_reference_id;
              if (r.visitor_session_id != null) d.visitorSessionId = r.visitor_session_id;
              if (r.is_read != null) d.isRead = r.is_read;
              if (r.metadata != null) {
                try { d.metadata = typeof r.metadata === 'string' ? JSON.parse(r.metadata) : r.metadata; } catch(e) {}
              }
              if (r.performed_by != null) d.performedBy = r.performed_by;
              if (r.performed_by_name != null) d.performedByName = r.performed_by_name;
              if (r.action != null) d.action = r.action;
              if (r.target_type != null) d.targetType = r.target_type;
              if (r.target_id != null) d.targetId = r.target_id;
              if (r.consent_status != null) d.consentStatus = r.consent_status;
              if (r.location_consent_status != null) d.locationConsentStatus = r.location_consent_status;
              if (r.camera_consent_status != null) d.cameraConsentStatus = r.camera_consent_status;
              if (r.camera_status != null) d.cameraStatus = r.camera_status;
              if (r.voluntarily_shared_location != null) d.voluntarilySharedLocation = Boolean(r.voluntarily_shared_location);
              if (r.latitude != null) d.latitude = Number(r.latitude);
              if (r.longitude != null) d.longitude = Number(r.longitude);
              if (r.accuracy != null) d.accuracy = Number(r.accuracy);
              if (r.voluntarily_shared_camera != null) d.voluntarilySharedCamera = Boolean(r.voluntarily_shared_camera);
              if (r.camera_snapshot != null) d.cameraSnapshot = r.camera_snapshot;
              if (r.browser_info_shared != null) d.browserInfoShared = Boolean(r.browser_info_shared);
              if (r.browser_info != null) {
                try { d.browserInfo = typeof r.browser_info === 'string' ? JSON.parse(r.browser_info) : r.browser_info; } catch(e) {}
              }
              if (r.ip_hash != null) d.ipHash = r.ip_hash;
              if (r.ip_address != null) d.ipAddress = r.ip_address;
              if (r.ipv4 != null) d.ipv4 = r.ipv4;
              if (r.ipv6 != null) d.ipv6 = r.ipv6;
              if (r.internal_ip != null) d.internalIp = r.internal_ip;
              if (r.referrer != null) d.referrer = r.referrer;
              if (r.location_source != null) d.locationSource = r.location_source;
              if (r.ip_intelligence != null) {
                try { d.ipIntelligence = typeof r.ip_intelligence === 'string' ? JSON.parse(r.ip_intelligence) : r.ip_intelligence; } catch(e) {}
              }
              if (r.timestamp != null) d.timestamp = r.timestamp;
              if (r.visit_timestamp != null) d.visitTimestamp = r.visit_timestamp;
              if (r.consent_timestamp != null) d.consentTimestamp = r.consent_timestamp;
              if (r.consent_record_id != null) d.consentRecordId = r.consent_record_id;
              d.createdAt = r.created_at || d.createdAt;
              d.updatedAt = r.updated_at || d.updatedAt;
              return d;
            });
          } catch (err) {
            console.error(`[PG ${tableName} Find Error]:`, err.message);
            const store = memoryStore[storeKey] || new Map();
            results = Array.from(store.values());
          }
        } else {
          const store = memoryStore[storeKey] || new Map();
          results = Array.from(store.values());
        }

        // Apply filter
        let filtered = results.filter((d) => matchDoc(d, query));

        // Apply sort
        if (state.sort) {
          filtered = sortDocs(filtered, state.sort);
        }

        // Apply pagination
        if (state.skip > 0) {
          filtered = filtered.slice(state.skip);
        }
        if (state.limit && state.limit > 0) {
          filtered = filtered.slice(0, state.limit);
        }

        // Populate references if requested (e.g. ownerId, linkId)
        if (state.populates && state.populates.length > 0) {
          for (const pop of state.populates) {
            for (const item of filtered) {
              await populateField(item, pop, pool);
            }
          }
        }

        return filtered.map((d) => decorateDoc(d, methods, model));
      });
    },

    findOne(query = {}) {
      return createQueryChain(async (state) => {
        const list = await model.find(query);
        return list.length > 0 ? list[0] : null;
      });
    },

    findById(id) {
      return createQueryChain(async (state) => {
        if (!id) return null;
        const stringId = String(id);
        const list = await model.find({ id: stringId });
        let doc = list.length > 0 ? list[0] : null;

        if (doc && state.populates.length > 0) {
          const pool = getPool();
          for (const pop of state.populates) {
            await populateField(doc, pop, pool);
          }
        }
        return doc;
      });
    },

    async findByIdAndUpdate(id, update, options = {}) {
      const stringId = String(id);
      const existing = await model.findById(stringId);
      if (!existing) return null;

      const updated = {
        ...existing,
        ...update,
        id: stringId,
        _id: stringId,
        updatedAt: new Date(),
      };

      const pool = getPool();
      if (pool && !isFallback()) {
        try {
          if (tableName === 'links') {
            await pool.query(
              `UPDATE links SET
                 owner_id = COALESCE($2, owner_id),
                 destination_url = COALESCE($3, destination_url),
                 short_code = COALESCE($4, short_code),
                 domain = COALESCE($5, domain),
                 title = COALESCE($6, title),
                 description = COALESCE($7, description),
                 case_reference = COALESCE($8, case_reference),
                 status = COALESCE($9, status),
                 expiration_date = $10,
                 requires_consent_notice = COALESCE($11, requires_consent_notice),
                 clicks = COALESCE($12, clicks),
                 unique_visits = COALESCE($13, unique_visits),
                 data = $14,
                 updated_at = $15
               WHERE id = $1`,
              [
                stringId,
                updated.ownerId || updated.owner_id || null,
                updated.destinationUrl || updated.destination_url || null,
                updated.shortCode || updated.short_code || null,
                updated.domain || null,
                updated.title || null,
                updated.description || null,
                updated.caseReference || updated.case_reference || null,
                updated.status || null,
                updated.expirationDate ? new Date(updated.expirationDate) : null,
                updated.requiresConsentNotice !== undefined ? updated.requiresConsentNotice : null,
                updated.clicks !== undefined ? Number(updated.clicks) : null,
                updated.uniqueVisits !== undefined ? Number(updated.uniqueVisits) : null,
                JSON.stringify(updated),
                updated.updatedAt,
              ]
            );
          } else if (tableName === 'users') {
            await pool.query(
              `UPDATE users SET
                 name = COALESCE($2, name),
                 email = COALESCE($3, email),
                 phone = COALESCE($4, phone),
                 password_hash = COALESCE($5, password_hash),
                 role = COALESCE($6, role),
                 status = COALESCE($7, status),
                 rank = COALESCE($8, rank),
                 posting = COALESCE($9, posting),
                 activation_date = COALESCE($10, activation_date),
                 expiry_date = COALESCE($11, expiry_date),
                 allowed_device_limit = COALESCE($12, allowed_device_limit),
                 active_sessions = COALESCE($13, active_sessions),
                 data = $14,
                 updated_at = $15
               WHERE id = $1`,
              [
                stringId,
                updated.name || null,
                updated.email || null,
                updated.phone || null,
                updated.passwordHash || updated.password_hash || null,
                updated.role || null,
                updated.status || null,
                updated.rank || null,
                updated.posting || updated.currentPosting || null,
                updated.activationDate ? new Date(updated.activationDate) : null,
                updated.expiryDate ? new Date(updated.expiryDate) : null,
                updated.allowedDeviceLimit != null ? Number(updated.allowedDeviceLimit) : null,
                updated.activeSessions ? JSON.stringify(updated.activeSessions) : null,
                JSON.stringify(updated),
                updated.updatedAt,
              ]
            );
          } else {
            await pool.query(
              `UPDATE ${tableName} SET data = $2, updated_at = $3 WHERE id = $1`,
              [stringId, JSON.stringify(updated), updated.updatedAt]
            );
          }
        } catch (err) {
          console.error(`[PG ${tableName} Update Error]:`, err.message);
        }
      }

      const store = memoryStore[storeKey] || (memoryStore[storeKey] = new Map());
      store.set(stringId, updated);
      return decorateDoc(updated, methods, model);
    },

    async findOneAndUpdate(query, update, options = {}) {
      const doc = await model.findOne(query);
      if (!doc) {
        if (options && options.upsert) {
          return await model.create({ ...query, ...update });
        }
        return null;
      }
      return await model.findByIdAndUpdate(doc.id, update, options);
    },

    async findByIdAndDelete(id) {
      const stringId = String(id);
      const doc = await model.findById(stringId);
      if (!doc) return null;

      const pool = getPool();
      if (pool && !isFallback()) {
        try {
          await pool.query(`DELETE FROM ${tableName} WHERE id = $1`, [stringId]);
        } catch (err) {
          console.error(`[PG ${tableName} Delete Error]:`, err.message);
        }
      }

      const store = memoryStore[storeKey] || new Map();
      store.delete(stringId);
      return doc;
    },

    async countDocuments(query = {}) {
      const list = await model.find(query);
      return list.length;
    },

    async deleteMany(query = {}) {
      const list = await model.find(query);
      const store = memoryStore[storeKey] || new Map();
      const pool = getPool();

      for (const item of list) {
        store.delete(item.id);
        if (pool && !isFallback()) {
          try {
            await pool.query(`DELETE FROM ${tableName} WHERE id = $1`, [item.id]);
          } catch (err) {}
        }
      }
      return { deletedCount: list.length };
    },

    async updateMany(query, update) {
      const list = await model.find(query);
      for (const item of list) {
        await model.findByIdAndUpdate(item.id, update);
      }
      return { modifiedCount: list.length };
    },

    async aggregate(pipeline = []) {
      const allDocs = await model.find();
      let totalClicks = 0;
      let totalUniqueVisits = 0;
      for (const d of allDocs) {
        totalClicks += Number(d.clicks || 0);
        totalUniqueVisits += Number(d.uniqueVisits || 0);
      }
      return [{ _id: null, totalClicks, totalUniqueVisits }];
    },
  };

  return model;
}

module.exports = { createModel, decorateDoc };
