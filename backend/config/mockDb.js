const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const uuid = () => crypto.randomUUID();

const ADMIN_ID = 'd3b07384-d113-4ec2-a5d9-4828691512f4';
const MARKETING_ID = 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d';

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}

function buildSeedData() {
  const now = new Date().toISOString();
  const users = [
    {
      id: ADMIN_ID,
      full_name: 'Ayaanle Mohamed',
      email: 'admin@booqasho.com',
      phone: '+252615123456',
      address: 'Hodan District, Mogadishu',
      role: 'admin',
      department: 'Marketing Management',
      password_hash: '$2a$10$hDRfuAN4DErMn70PkmnHo.l4N1FNkJMUXz5r2JCWaTK8p5Va99TNe',
      is_verified: true,
      created_at: now
    },
    {
      id: MARKETING_ID,
      full_name: 'Fahad Omar',
      email: 'marketing@booqasho.com',
      phone: '+252615778899',
      address: 'Wadajir District, Mogadishu',
      role: 'marketing',
      department: 'Field Marketing',
      password_hash: '$2a$10$hDRfuAN4DErMn70PkmnHo.G7gREc3Y6XlfwSKwhKbss1oaj3j4gOq',
      is_verified: true,
      created_at: now
    },
    {
      id: 'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e',
      full_name: 'Sahra Ali',
      email: 'sahra@booqasho.com',
      phone: '+252615334455',
      address: 'Hamar Weyne, Mogadishu',
      role: 'marketing',
      department: 'Field Marketing',
      password_hash: bcrypt.hashSync('marketing123', 10),
      is_verified: true,
      created_at: now
    }
  ];

  const visits = [
    { id: uuid(), user_id: MARKETING_ID, place_name: 'Barwaaqo Supermarket', place_type: 'Shop', address: 'Hodan District, KM4', latitude: 2.0469, longitude: 45.3182, contact_person: 'Mohamed Hassan', phone: '+252615111222', visit_date: daysAgo(0), visit_time: '09:30', purpose: 'EVC Plus promotion', activities: 'Product demo', status: 'Successful', result: 'New merchant onboarded', comments: 'Interested in bulk SIM cards', created_at: now },
    { id: uuid(), user_id: MARKETING_ID, place_name: 'Hormuud Retail Hub', place_type: 'Business', address: 'Wadajir District', latitude: 2.0378, longitude: 45.3045, contact_person: 'Amina Yusuf', phone: '+252615333444', visit_date: daysAgo(1), visit_time: '11:00', purpose: 'Fiber internet pitch', activities: 'Site survey', status: 'Pending', result: '', comments: 'Follow-up scheduled', created_at: now },
    { id: uuid(), user_id: MARKETING_ID, place_name: 'Jubba Restaurant', place_type: 'Restaurant', address: 'Maka Al-Mukarama', latitude: 2.0412, longitude: 45.3421, contact_person: 'Omar Farah', phone: '+252615555666', visit_date: daysAgo(2), visit_time: '14:15', purpose: 'WiFi bundle offer', activities: 'Presentation', status: 'Failed', result: 'Budget constraints', comments: 'Retry next month', created_at: now },
    { id: uuid(), user_id: 'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e', place_name: 'Banadir Hospital', place_type: 'Hospital', address: 'Howlwadaag', latitude: 2.0523, longitude: 45.3289, contact_person: 'Dr. Halima', phone: '+252615777888', visit_date: daysAgo(1), visit_time: '10:00', purpose: 'Corporate SIM plan', activities: 'Meeting with admin', status: 'Successful', result: '50 SIM order', comments: 'Contract signed', created_at: now },
    { id: uuid(), user_id: 'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e', place_name: 'Al-Noor School', place_type: 'School', address: 'Waberi District', latitude: 2.0298, longitude: 45.3156, contact_person: 'Principal Ahmed', phone: '+252615999000', visit_date: daysAgo(3), visit_time: '08:45', purpose: 'Student data bundles', activities: 'Proposal delivery', status: 'Successful', result: 'Partnership agreed', comments: '', created_at: now },
    { id: uuid(), user_id: MARKETING_ID, place_name: 'Tech Solutions Ltd', place_type: 'Company', address: 'Hamar Weyne', latitude: 2.0334, longitude: 45.3378, contact_person: 'Yusuf Abdi', phone: '+252615222333', visit_date: daysAgo(4), visit_time: '16:00', purpose: 'Enterprise package', activities: 'Demo', status: 'Successful', result: 'Trial started', comments: '', created_at: now },
    { id: uuid(), user_id: MARKETING_ID, place_name: 'Corner Shop Waberi', place_type: 'Shop', address: 'Waberi', latitude: 2.0287, longitude: 45.3102, contact_person: 'Fatima Noor', phone: '+252615444555', visit_date: daysAgo(5), visit_time: '12:30', purpose: 'EVC agent registration', activities: 'Onboarding', status: 'Successful', result: 'Agent activated', comments: '', created_at: now },
    { id: uuid(), user_id: 'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e', place_name: 'City Mall', place_type: 'Business', address: 'KM4 Area', latitude: 2.0445, longitude: 45.3201, contact_person: 'Hassan Ali', phone: '+252615666777', visit_date: daysAgo(6), visit_time: '15:00', purpose: 'Mall WiFi coverage', activities: 'Site assessment', status: 'Pending', result: '', comments: 'Awaiting management approval', created_at: now }
  ];

  const auditLogs = [
    { id: uuid(), user_id: ADMIN_ID, action: 'LOGIN', description: 'Admin logged in successfully', timestamp: now },
    { id: uuid(), user_id: MARKETING_ID, action: 'LOGIN', description: 'Marketing user logged in', timestamp: now },
    { id: uuid(), user_id: MARKETING_ID, action: 'CREATE_VISIT', description: 'Logged visit to Barwaaqo Supermarket', timestamp: now }
  ];

  return { users, visits, auditLogs, otps: [], passwordResets: [] };
}

function createMockDb() {
  const store = buildSeedData();

  const dbUpdate = (collection, id, updates) => {
    const idx = store[collection].findIndex(item => item.id === id);
    if (idx === -1) return null;
    store[collection][idx] = { ...store[collection][idx], ...updates };
    return store[collection][idx];
  };

  return {
    isMock: true,
    pool: null,

    users: {
      findMany: async () => [...store.users].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
      findOne: async (filter) => {
        const key = Object.keys(filter)[0];
        return store.users.find(u => u[key] === filter[key]) || null;
      },
      create: async (userData) => {
        const password = userData.password_hash || userData.password || '';
        const password_hash = password.startsWith('$2a$') ? password : bcrypt.hashSync(password, 10);
        const user = {
          id: uuid(),
          full_name: userData.full_name,
          email: userData.email,
          phone: userData.phone || '',
          address: userData.address || '',
          role: userData.role || 'marketing',
          department: userData.department || 'Field Marketing',
          password_hash,
          is_verified: userData.is_verified || false,
          created_at: new Date().toISOString()
        };
        store.users.push(user);
        return user;
      },
      update: async (id, updates) => {
        if (updates.password) {
          updates.password_hash = bcrypt.hashSync(updates.password, 10);
          delete updates.password;
        }
        return dbUpdate('users', id, updates);
      },
      delete: async (id) => {
        const idx = store.users.findIndex(u => u.id === id);
        if (idx === -1) return null;
        const [removed] = store.users.splice(idx, 1);
        store.visits = store.visits.filter(v => v.user_id !== id);
        return removed;
      }
    },

    visits: {
      findMany: async (filters = {}) => {
        let list = store.visits.map(v => {
          const user = store.users.find(u => u.id === v.user_id);
          return { ...v, employee_name: user?.full_name || 'Unknown Employee', employee_email: user?.email || '' };
        });

        if (filters.user_id) list = list.filter(v => v.user_id === filters.user_id);
        if (filters.status && filters.status !== 'All') list = list.filter(v => v.status === filters.status);
        if (filters.place_type && filters.place_type !== 'All') list = list.filter(v => v.place_type === filters.place_type);
        if (filters.startDate) list = list.filter(v => v.visit_date >= filters.startDate);
        if (filters.endDate) list = list.filter(v => v.visit_date <= filters.endDate);
        if (filters.search) {
          const s = filters.search.toLowerCase();
          list = list.filter(v =>
            v.place_name.toLowerCase().includes(s) ||
            (v.address || '').toLowerCase().includes(s) ||
            (v.contact_person || '').toLowerCase().includes(s) ||
            (v.employee_name || '').toLowerCase().includes(s)
          );
        }

        return list.sort((a, b) => {
          const d = b.visit_date.localeCompare(a.visit_date);
          return d !== 0 ? d : (b.visit_time || '').localeCompare(a.visit_time || '');
        });
      },
      findOne: async (id) => {
        const visit = store.visits.find(v => v.id === id);
        if (!visit) return null;
        const user = store.users.find(u => u.id === visit.user_id);
        return { ...visit, employee_name: user?.full_name || 'Unknown', employee_email: user?.email || '', employee_phone: user?.phone || '' };
      },
      create: async (visitData) => {
        const visit = {
          id: uuid(),
          user_id: visitData.user_id,
          place_name: visitData.place_name,
          place_type: visitData.place_type,
          address: visitData.address || '',
          latitude: visitData.latitude || 0,
          longitude: visitData.longitude || 0,
          contact_person: visitData.contact_person || '',
          phone: visitData.phone || '',
          visit_date: visitData.visit_date,
          visit_time: visitData.visit_time,
          purpose: visitData.purpose || '',
          activities: visitData.activities || '',
          status: visitData.status || 'Pending',
          result: visitData.result || '',
          comments: visitData.comments || '',
          created_at: new Date().toISOString()
        };
        store.visits.push(visit);
        return visit;
      },
      update: async (id, updates) => dbUpdate('visits', id, updates),
      delete: async (id) => {
        const idx = store.visits.findIndex(v => v.id === id);
        if (idx === -1) return null;
        const [removed] = store.visits.splice(idx, 1);
        return removed;
      }
    },

    auditLogs: {
      findMany: async () => store.auditLogs.map(l => {
        const user = store.users.find(u => u.id === l.user_id);
        return { ...l, full_name: user?.full_name || 'System' };
      }).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)),
      create: async (logData) => {
        const log = { id: uuid(), ...logData, timestamp: new Date().toISOString() };
        store.auditLogs.unshift(log);
        return log;
      }
    },

    otps: {
      create: async (otpData) => {
        const otp = { id: uuid(), ...otpData, is_used: false, created_at: new Date().toISOString() };
        store.otps.push(otp);
        return otp;
      },
      findOne: async (filter) => {
        const key = Object.keys(filter)[0];
        return [...store.otps].reverse().find(o => o[key] === filter[key] && !o.is_used) || null;
      },
      update: async (id, updates) => dbUpdate('otps', id, updates)
    },

    passwordResets: {
      create: async (resetData) => {
        const reset = { id: uuid(), ...resetData, is_used: false, created_at: new Date().toISOString() };
        store.passwordResets.push(reset);
        return reset;
      },
      findOne: async (filter) => {
        const key = Object.keys(filter)[0];
        return [...store.passwordResets].reverse().find(r => r[key] === filter[key] && !r.is_used) || null;
      },
      update: async (id, updates) => dbUpdate('passwordResets', id, updates)
    }
  };
}

module.exports = createMockDb;
