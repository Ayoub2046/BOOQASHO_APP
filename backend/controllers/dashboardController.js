const db = require('../config/db');

const formatDate = (d) => {
  if (!d) return '';
  const dateObj = (d instanceof Date) ? d : new Date(d);
  if (isNaN(dateObj.getTime())) return '';
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

exports.getStats = async (req, res) => {
  try {
    const visits = await db.visits.findMany();
    const users = await db.users.findMany();
    const logs = await db.auditLogs.findMany();

    const todayStr = formatDate(new Date());

    // --- MARKETING USER DASHBOARD STATS ---
    if (req.user.role === 'marketing') {
      const myVisits = visits.filter(v => v.user_id === req.user.id);
      const successful = myVisits.filter(v => v.status === 'Successful').length;
      const failed = myVisits.filter(v => v.status === 'Failed').length;
      const pending = myVisits.filter(v => v.status === 'Pending').length;
      const visitsToday = myVisits.filter(v => formatDate(v.visit_date) === todayStr).length;

      const successRate = myVisits.length > 0 
        ? Math.round((successful / myVisits.length) * 100) 
        : 0;

      // Personal list by place type
      const placeTypeCounts = {};
      myVisits.forEach(v => {
        placeTypeCounts[v.place_type] = (placeTypeCounts[v.place_type] || 0) + 1;
      });

      return res.status(200).json({
        success: true,
        data: {
          role: 'marketing',
          summary: {
            totalVisits: myVisits.length,
            successful,
            failed,
            pending,
            visitsToday,
            successRate
          },
          placeTypeCounts,
          recentVisits: myVisits.slice(0, 5)
        }
      });
    }

    // --- ADMIN DASHBOARD STATS ---
    const totalUsers = users.length;
    const totalVisits = visits.length;
    const successful = visits.filter(v => v.status === 'Successful').length;
    const failed = visits.filter(v => v.status === 'Failed').length;
    const pending = visits.filter(v => v.status === 'Pending').length;
    const visitsToday = visits.filter(v => formatDate(v.visit_date) === todayStr).length;

    const successRate = (successful + failed) > 0 
      ? Math.round((successful / (successful + failed)) * 100) 
      : 0;

    // Staff Performance Ranking
    const staffStats = {};
    users.forEach(u => {
      if (u.role === 'marketing') {
        staffStats[u.id] = {
          id: u.id,
          name: u.full_name,
          email: u.email,
          total: 0,
          success: 0,
          failed: 0
        };
      }
    });

    visits.forEach(v => {
      if (staffStats[v.user_id]) {
        staffStats[v.user_id].total += 1;
        if (v.status === 'Successful') staffStats[v.user_id].success += 1;
        if (v.status === 'Failed') staffStats[v.user_id].failed += 1;
      }
    });

    const activeStaff = Object.values(staffStats)
      .sort((a, b) => b.total - a.total)
      .map(s => ({
        ...s,
        rate: s.total > 0 ? Math.round((s.success / s.total) * 100) : 0
      }));

    // Trends by date (last 7 days)
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = formatDate(d);
      
      const dayVisits = visits.filter(v => formatDate(v.visit_date) === dateStr);
      const daySuccess = dayVisits.filter(v => v.status === 'Successful').length;
      const dayFailed = dayVisits.filter(v => v.status === 'Failed').length;

      // Extract day name (e.g. "Mon")
      const label = d.toLocaleDateString('en-US', { weekday: 'short' });

      last7Days.push({
        date: dateStr,
        label,
        total: dayVisits.length,
        success: daySuccess,
        failed: dayFailed
      });
    }

    res.status(200).json({
      success: true,
      data: {
        role: 'admin',
        summary: {
          totalUsers,
          totalVisits,
          successful,
          failed,
          pending,
          visitsToday,
          successRate
        },
        activeStaff,
        recentLogs: logs.slice(0, 8),
        trends: last7Days
      }
    });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ success: false, message: 'Cilad baa ka dhacday diyaarinta warbixinta Dashboard-ka.' });
  }
};
