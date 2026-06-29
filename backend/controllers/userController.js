const bcrypt = require('bcryptjs');
const db = require('../config/db');

exports.getUsers = async (req, res) => {
  try {
    const users = await db.users.findMany();
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, message: 'Fashil baa ku yimid soo akhrinta users.' });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await db.users.findOne({ id: req.params.id });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User-ka lama helin.' });
    }
    const { password_hash, ...userDetails } = user;
    res.status(200).json({ success: true, data: userDetails });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ success: false, message: 'Fashil baa ku yimid soo akhrinta user-ka.' });
  }
};

exports.createUser = async (req, res) => {
  const { full_name, email, phone, address, role, department, password } = req.body;

  if (!full_name || !email || !phone || !address || !password) {
    return res.status(400).json({ success: false, message: 'Fadlan buuxi Magaca, Email-ka, Telefoonka, Cinwaanka, iyo Password-ka.' });
  }

  let normalizedPhone = phone.trim().replace(/\s/g, '');
  if (/^0\d{8,9}$/.test(normalizedPhone)) {
    normalizedPhone = '+252' + normalizedPhone.slice(1);
  } else if (/^\d{9}$/.test(normalizedPhone)) {
    normalizedPhone = '+252' + normalizedPhone;
  } else if (!/^\+?252\d{7,9}$/.test(normalizedPhone)) {
    return res.status(400).json({ success: false, message: 'Fadlan geli telefoon sax ah (tusaale: +25261XXXXXXX ama 0615XXXXXXX).' });
  }
  if (!normalizedPhone.startsWith('+')) {
    normalizedPhone = '+' + normalizedPhone;
  }

  try {
    const existingUser = await db.users.findOne({ email: email.trim().toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email-kan mar hore ayaa la diiwaangeliyey.' });
    }

    const password_hash = bcrypt.hashSync(password, 10);
    const newUser = await db.users.create({
      full_name: full_name.trim(),
      email: email.trim().toLowerCase(),
      phone: normalizedPhone,
      address: address.trim(),
      role,
      department: department || 'Field Marketing',
      password_hash,
      is_verified: true
    });

    await db.auditLogs.create({
      user_id: req.user.id,
      action: 'CREATE_USER',
      description: `Created user ${full_name} (${email}) as ${role}`
    });

    res.status(201).json({ success: true, message: 'User-ka si guul leh ayaa loo diiwaangeliyey.', data: newUser });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ success: false, message: 'Waa la awoodi waayey in la abuuro user-ka.' });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const updates = { ...req.body };
    if (updates.password) {
      updates.password_hash = bcrypt.hashSync(updates.password, 10);
      delete updates.password;
    }

    const user = await db.users.findOne({ id: userId });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User-ka lama helin.' });
    }

    const updatedUser = await db.users.update(userId, updates);

    await db.auditLogs.create({
      user_id: req.user.id,
      action: 'UPDATE_USER',
      description: `Updated user info for ${user.full_name}`
    });

    res.status(200).json({ success: true, message: 'User-ka si guul leh ayaa loo cusbooneysiiyey.', data: updatedUser });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ success: false, message: 'Fashil baa ku yimid cusbooneysiinta user-ka.' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Prevent self-deletion
    if (userId === req.user.id) {
      return res.status(400).json({ success: false, message: 'Uma awoodid inaad is-tirto naftaada.' });
    }

    const user = await db.users.findOne({ id: userId });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User-ka lama helin.' });
    }

    await db.users.delete(userId);

    await db.auditLogs.create({
      user_id: req.user.id,
      action: 'DELETE_USER',
      description: `Deleted user ${user.full_name} (${user.email})`
    });

    res.status(200).json({ success: true, message: 'User-ka si guul leh ayaa loo tiray.' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ success: false, message: 'Fashil baa ku yimid tirista user-ka.' });
  }
};
