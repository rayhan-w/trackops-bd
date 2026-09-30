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

function matchDoc(doc, query) {
  if (!query || Object.keys(query).length === 0) return true;

  for (const [key, value] of Object.entries(query)) {
    if (key === '$or' && Array.isArray(value)) {
      const orMatched = value.some((subQuery) => matchDoc(doc, subQuery));
      if (!orMatched) return false;
      continue;
    }

    const docVal = doc[key] !== undefined ? doc[key] : (key === '_id' ? doc.id : undefined);

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

function decorateDoc(doc, methods = {}) {
  if (!doc) return null;
  const wrapped = { ...doc };
  wrapped._id = wrapped.id || wrapped._id;
  wrapped.id = wrapped._id;

  wrapped.toObject = function () {
    return { ...wrapped };
  };

  for (const [name, fn] of Object.entries(methods)) {
    wrapped[name] = fn.bind(wrapped);
  }

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
          const res = await pool.query(
            `INSERT INTO ${tableName} (id, data, created_at, updated_at)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (id) DO UPDATE SET data = $2, updated_at = $4
             RETURNING *`,
            [id, JSON.stringify(doc), doc.createdAt, doc.updatedAt]
          );
          const saved = res.rows[0].data || doc;
          saved.id = res.rows[0].id;
          saved._id = res.rows[0].id;
          return decorateDoc(saved, methods);
        } catch (err) {
          console.warn(`[PG ${tableName} Create Falling Back]:`, err.message);
        }
      }

      // Memory fallback
      const store = memoryStore[storeKey] || (memoryStore[storeKey] = new Map());
      store.set(id, doc);
      return decorateDoc(doc, methods);
    },

    find(query = {}) {
      return createQueryChain(async (state) => {
        let results = [];
        const pool = getPool();

        if (pool && !isFallback()) {
          try {
            const res = await pool.query(`SELECT id, data, created_at, updated_at FROM ${tableName}`);
            results = res.rows.map((r) => {
              const d = typeof r.data === 'string' ? JSON.parse(r.data) : r.data;
              d.id = r.id;
              d._id = r.id;
              d.createdAt = r.created_at;
              d.updatedAt = r.updated_at;
              return d;
            });
          } catch (err) {
            console.warn(`[PG ${tableName} Find Falling Back]:`, err.message);
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

        // Populate references if requested (e.g. ownerId)
        if (state.populates && state.populates.length > 0) {
          for (const pop of state.populates) {
            for (const item of filtered) {
              const refId = item[pop.field];
              if (refId) {
                const userStore = memoryStore.users || new Map();
                let userObj = userStore.get(String(refId));
                if (userObj) {
                  item[pop.field] = decorateDoc(userObj);
                }
              }
            }
          }
        }

        return filtered.map((d) => decorateDoc(d, methods));
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
          for (const pop of state.populates) {
            const refId = doc[pop.field];
            if (refId) {
              const userStore = memoryStore.users || new Map();
              const userObj = userStore.get(String(refId));
              if (userObj) {
                doc[pop.field] = decorateDoc(userObj);
              }
            }
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
          await pool.query(
            `UPDATE ${tableName} SET data = $2, updated_at = $3 WHERE id = $1`,
            [stringId, JSON.stringify(updated), updated.updatedAt]
          );
        } catch (err) {
          console.warn(`[PG ${tableName} Update Falling Back]:`, err.message);
        }
      }

      const store = memoryStore[storeKey] || (memoryStore[storeKey] = new Map());
      store.set(stringId, updated);
      return decorateDoc(updated, methods);
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
          console.warn(`[PG ${tableName} Delete Falling Back]:`, err.message);
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
