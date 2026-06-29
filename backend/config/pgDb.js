const dbUpdate = async (pool, table, id, updates) => {
  const keys = Object.keys(updates).filter(k => k !== 'id');
  if (keys.length === 0) return null;

  const setClause = keys.map((k, idx) => `"${k}" = $${idx + 2}`).join(', ');
  const values = keys.map(k => updates[k]);

  const query = `UPDATE "${table}" SET ${setClause} WHERE id = $1 RETURNING *`;
  const res = await pool.query(query, [id, ...values]);
  return res.rows[0];
};

function createPgDb(pool) {
  return {
    isMock: false,
    pool,

    users: {
      findMany: async () => {
        const res = await pool.query('SELECT * FROM users ORDER BY created_at DESC');
        return res.rows;
      },
      findOne: async (filter) => {
        const key = Object.keys(filter)[0];
        const val = filter[key];
        const res = await pool.query(`SELECT * FROM users WHERE "${key}" = $1 LIMIT 1`, [val]);
        return res.rows[0] || null;
      },
      create: async (userData) => {
        const query = `
          INSERT INTO users (full_name, email, phone, address, role, department, password_hash, is_verified)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          RETURNING *
        `;
        const values = [
          userData.full_name,
          userData.email,
          userData.phone || '',
          userData.address || '',
          userData.role || 'marketing',
          userData.department || 'Field Marketing',
          userData.password_hash || userData.password || '',
          userData.is_verified || false
        ];
        const res = await pool.query(query, values);
        return res.rows[0];
      },
      update: async (id, updates) => dbUpdate(pool, 'users', id, updates),
      delete: async (id) => {
        const res = await pool.query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);
        return res.rows[0];
      }
    },

    visits: {
      findMany: async (filters = {}) => {
        let query = `
          SELECT v.*, u.full_name as employee_name, u.email as employee_email
          FROM visits v
          LEFT JOIN users u ON v.user_id = u.id
          WHERE 1=1
        `;
        const values = [];
        let valIdx = 1;

        if (filters.user_id) {
          query += ` AND v.user_id = $${valIdx++}`;
          values.push(filters.user_id);
        }
        if (filters.status && filters.status !== 'All') {
          query += ` AND v.status = $${valIdx++}`;
          values.push(filters.status);
        }
        if (filters.place_type && filters.place_type !== 'All') {
          query += ` AND v.place_type = $${valIdx++}`;
          values.push(filters.place_type);
        }
        if (filters.startDate) {
          query += ` AND v.visit_date >= $${valIdx++}`;
          values.push(filters.startDate);
        }
        if (filters.endDate) {
          query += ` AND v.visit_date <= $${valIdx++}`;
          values.push(filters.endDate);
        }

        query += ' ORDER BY v.visit_date DESC, v.visit_time DESC';

        const res = await pool.query(query, values);
        let list = res.rows.map(v => ({
          ...v,
          employee_name: v.employee_name || 'Unknown Employee'
        }));

        if (filters.search) {
          const s = filters.search.toLowerCase();
          list = list.filter(v =>
            v.place_name.toLowerCase().includes(s) ||
            v.address.toLowerCase().includes(s) ||
            v.contact_person.toLowerCase().includes(s) ||
            v.employee_name.toLowerCase().includes(s)
          );
        }

        return list;
      },
      findOne: async (id) => {
        const query = `
          SELECT v.*, u.full_name as employee_name, u.email as employee_email, u.phone as employee_phone
          FROM visits v
          LEFT JOIN users u ON v.user_id = u.id
          WHERE v.id = $1
        `;
        const res = await pool.query(query, [id]);
        const data = res.rows[0] || null;
        if (data) data.employee_name = data.employee_name || 'Unknown';
        return data;
      },
      create: async (visitData) => {
        const query = `
          INSERT INTO visits (user_id, place_name, place_type, address, latitude, longitude, contact_person, phone, visit_date, visit_time, purpose, activities, status, result, comments)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
          RETURNING *
        `;
        const values = [
          visitData.user_id,
          visitData.place_name,
          visitData.place_type,
          visitData.address || '',
          visitData.latitude || 0,
          visitData.longitude || 0,
          visitData.contact_person || '',
          visitData.phone || '',
          visitData.visit_date,
          visitData.visit_time,
          visitData.purpose || '',
          visitData.activities || '',
          visitData.status || 'Pending',
          visitData.result || '',
          visitData.comments || ''
        ];
        const res = await pool.query(query, values);
        return res.rows[0];
      },
      update: async (id, updates) => dbUpdate(pool, 'visits', id, updates),
      delete: async (id) => {
        const res = await pool.query('DELETE FROM visits WHERE id = $1 RETURNING *', [id]);
        return res.rows[0];
      }
    },

    auditLogs: {
      findMany: async () => {
        const query = `
          SELECT a.*, u.full_name
          FROM audit_logs a
          LEFT JOIN users u ON a.user_id = u.id
          ORDER BY a.timestamp DESC
        `;
        const res = await pool.query(query);
        return res.rows.map(l => ({ ...l, full_name: l.full_name || 'System' }));
      },
      create: async (logData) => {
        const query = `
          INSERT INTO audit_logs (user_id, action, description)
          VALUES ($1, $2, $3)
          RETURNING *
        `;
        const values = [logData.user_id, logData.action, logData.description];
        const res = await pool.query(query, values);
        return res.rows[0];
      }
    },

    otps: {
      create: async (otpData) => {
        const query = `
          INSERT INTO otps (phone, otp_code, purpose, expires_at)
          VALUES ($1, $2, $3, $4)
          RETURNING *
        `;
        const values = [otpData.phone, otpData.otp_code, otpData.purpose || 'REGISTRATION', otpData.expires_at];
        const res = await pool.query(query, values);
        return res.rows[0];
      },
      findOne: async (filter) => {
        const key = Object.keys(filter)[0];
        const val = filter[key];
        const query = `SELECT * FROM otps WHERE "${key}" = $1 AND is_used = false ORDER BY created_at DESC LIMIT 1`;
        const res = await pool.query(query, [val]);
        return res.rows[0] || null;
      },
      update: async (id, updates) => dbUpdate(pool, 'otps', id, updates)
    },

    passwordResets: {
      create: async (resetData) => {
        const query = `
          INSERT INTO password_resets (user_id, reset_token, expires_at)
          VALUES ($1, $2, $3)
          RETURNING *
        `;
        const values = [resetData.user_id, resetData.reset_token, resetData.expires_at];
        const res = await pool.query(query, values);
        return res.rows[0];
      },
      findOne: async (filter) => {
        const key = Object.keys(filter)[0];
        const val = filter[key];
        const query = `SELECT * FROM password_resets WHERE "${key}" = $1 AND is_used = false ORDER BY created_at DESC LIMIT 1`;
        const res = await pool.query(query, [val]);
        return res.rows[0] || null;
      },
      update: async (id, updates) => dbUpdate(pool, 'password_resets', id, updates)
    }
  };
}

module.exports = createPgDb;
