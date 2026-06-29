const db = require('../config/db');

exports.getTodayTasks = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const tasks = await db.tasks.findMany({ date: today });
    const users = await db.users.findMany();

    const enriched = tasks.map(t => {
      const assignedBy = users.find(u => u.id === t.assigned_by);
      const assignedTo = users.find(u => u.id === t.assigned_to);
      return {
        ...t,
        assigned_by_name: assignedBy?.full_name || 'System',
        assigned_to_name: assignedTo?.full_name || 'All Staff'
      };
    });

    res.json({ success: true, data: enriched });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ success: false, message: 'Fashil baa ku yimid soo akhrinta hawshaha.' });
  }
};

exports.getMyTasks = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const tasks = await db.tasks.findMany({ date: today, user_id: req.user.id });
    const users = await db.users.findMany();

    const enriched = tasks.map(t => {
      const assignedBy = users.find(u => u.id === t.assigned_by);
      return {
        ...t,
        assigned_by_name: assignedBy?.full_name || 'System'
      };
    });

    res.json({ success: true, data: enriched });
  } catch (error) {
    console.error('Error fetching my tasks:', error);
    res.status(500).json({ success: false, message: 'Fashil baa ku yimid soo akhrinta hawshaha.' });
  }
};

exports.createTask = async (req, res) => {
  const { assigned_to, service, description, date } = req.body;

  if (!service || !description || !date) {
    return res.status(400).json({ success: false, message: 'Fadlan buuxi dhammaan meelaha daruuriga ah (Service, Description, Date).' });
  }

  try {
    const task = await db.tasks.create({
      assigned_by: req.user.id,
      assigned_to: assigned_to || null,
      service,
      description,
      date,
      status: 'pending'
    });

    await db.auditLogs.create({
      user_id: req.user.id,
      action: 'CREATE_TASK',
      description: `Assigned "${service}" task to ${assigned_to || 'all marketing staff'} for ${date}`
    });

    res.status(201).json({ success: true, message: 'Hawsha si guul leh ayaa loo sameeyey.', data: task });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ success: false, message: 'Waa la awoodi waayey in la sameeyo hawsha.' });
  }
};

exports.updateTaskStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const task = await db.tasks.findOne({ id });
    if (!task) {
      return res.status(404).json({ success: false, message: 'Hawsha lama helin.' });
    }

    await db.tasks.update(id, { status });

    await db.auditLogs.create({
      user_id: req.user.id,
      action: 'UPDATE_TASK_STATUS',
      description: `Updated task "${task.service}" status to ${status}`
    });

    res.json({ success: true, message: 'Heerka hawsha waa la cusbooneysiiyey.' });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ success: false, message: 'Fashil baa ku yimid cusbooneysiinta hawsha.' });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const task = await db.tasks.findOne({ id: req.params.id });
    if (!task) {
      return res.status(404).json({ success: false, message: 'Hawsha lama helin.' });
    }

    await db.tasks.delete(req.params.id);

    await db.auditLogs.create({
      user_id: req.user.id,
      action: 'DELETE_TASK',
      description: `Deleted task "${task.service}"`
    });

    res.json({ success: true, message: 'Hawsha si guul leh ayaa loo tiray.' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ success: false, message: 'Fashil baa ku yimid tirista hawsha.' });
  }
};

exports.getServices = async (req, res) => {
  res.json({
    success: true,
    data: [
      { id: 'evc-plus', name: 'EVC Plus (Mobile Money)' },
      { id: 'waafi', name: 'WAAFI App (Fintech)' },
      { id: 'gsm', name: 'GSM Mobile Services (Voice & Calls)' },
      { id: 'mobile-data', name: 'Mobile Data (2G/3G/4G/5G)' },
      { id: 'adsl-plus', name: 'ADSL Plus (Home Broadband)' },
      { id: 'ftth', name: 'FTTH (Fiber to the Home)' },
      { id: 'mifi', name: 'Hormuud Mifi (Portable WiFi)' },
      { id: 'hotspot', name: 'Hormuud Hotspot (Public WiFi)' },
      { id: 'enterprise-internet', name: 'Enterprise Internet (Business)' },
      { id: 'my-sms', name: 'My SMS (Bulk Messaging)' },
      { id: 'fixed-line', name: 'Fixed Line Services' },
      { id: 'international-roaming', name: 'International Roaming' },
      { id: 'international-calls', name: 'International Calls' },
      { id: '5g-plus', name: '5G Plus (LTE-A / LTE-Advanced)' },
      { id: 'evc-merchant', name: 'EVC Plus Merchant Registration' },
      { id: 'fibre-optics', name: 'Fibre Optic Connectivity' },
      { id: 'corporate-plans', name: 'Corporate & Enterprise Plans' },
      { id: 'salaam-foundation', name: 'Hormuud Salaam Foundation (CSR)' }
    ]
  });
};
