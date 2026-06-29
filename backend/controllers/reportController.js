const ExcelJS = require('exceljs');
const db = require('../config/db');

// Utility to fetch visits based on query params (matching visitController logic)
const fetchFilteredVisits = async (req) => {
  const filters = {
    status: req.query.status || 'All',
    place_type: req.query.place_type || 'All',
    search: req.query.search || '',
    startDate: req.query.startDate || '',
    endDate: req.query.endDate || ''
  };

  if (req.user.role === 'marketing') {
    filters.user_id = req.user.id;
  } else if (req.query.employee_id && req.query.employee_id !== 'All') {
    filters.user_id = req.query.employee_id;
  }

  return await db.visits.findMany(filters);
};

// Utility to fetch staff performance stats based on query params (matching dashboardController logic)
const fetchStaffPerformance = async (req) => {
  const users = await db.users.findMany();
  const visits = await db.visits.findMany();
  
  const staffStats = {};
  users.forEach(u => {
    if (u.role === 'marketing') {
      staffStats[u.id] = {
        id: u.id,
        name: u.full_name,
        email: u.email,
        total: 0,
        success: 0,
        failed: 0,
        pending: 0
      };
    }
  });

  visits.forEach(v => {
    if (staffStats[v.user_id]) {
      // Filter by date range if provided
      if (req.query.startDate && v.visit_date < req.query.startDate) return;
      if (req.query.endDate && v.visit_date > req.query.endDate) return;

      staffStats[v.user_id].total += 1;
      if (v.status === 'Successful') staffStats[v.user_id].success += 1;
      else if (v.status === 'Failed') staffStats[v.user_id].failed += 1;
      else if (v.status === 'Pending') staffStats[v.user_id].pending += 1;
    }
  });

  // Calculate success rates and return active staff
  return Object.values(staffStats).map(s => ({
    ...s,
    rate: s.total > 0 ? Math.round((s.success / s.total) * 100) : 0
  }));
};

// Get Report Preview count
exports.getPreview = async (req, res) => {
  try {
    const type = req.query.type || 'visits';
    if (type === 'performance') {
      const staffPerf = await fetchStaffPerformance(req);
      return res.status(200).json({
        success: true,
        data: {
          totalRecords: staffPerf.length
        }
      });
    } else {
      const visits = await fetchFilteredVisits(req);
      return res.status(200).json({
        success: true,
        data: {
          totalRecords: visits.length
        }
      });
    }
  } catch (error) {
    console.error('Report Preview Error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate report preview.' });
  }
};

// Export to Excel sheet
exports.exportExcel = async (req, res) => {
  try {
    const type = req.query.type || 'visits';
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Booqasho App';
    workbook.lastModifiedBy = req.user.full_name;
    workbook.created = new Date();

    if (type === 'performance') {
      const staffPerf = await fetchStaffPerformance(req);
      const worksheet = workbook.addWorksheet('KPI Performance Report');

      // Define columns
      worksheet.columns = [
        { header: 'Staff ID', key: 'id', width: 15 },
        { header: 'Employee Name', key: 'name', width: 25 },
        { header: 'Email Address', key: 'email', width: 30 },
        { header: 'Total Visits Logged', key: 'total', width: 20 },
        { header: 'Successful Visits', key: 'success', width: 18 },
        { header: 'Failed Visits', key: 'failed', width: 15 },
        { header: 'Pending Visits', key: 'pending', width: 15 },
        { header: 'Success Rate (%)', key: 'rate', width: 18 }
      ];

      // Format Header Row (Hormuud Green Theme)
      const headerRow = worksheet.getRow(1);
      headerRow.eachCell((cell) => {
        cell.font = { bold: true, color: { argb: 'FFFFFF' }, name: 'Segoe UI', size: 11 };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: '3CB043' } // Hormuud Corporate Green
        };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      });
      headerRow.height = 30;

      // Add data
      staffPerf.forEach((s) => {
        const row = worksheet.addRow({
          id: s.id,
          name: s.name,
          email: s.email,
          total: s.total,
          success: s.success,
          failed: s.failed,
          pending: s.pending,
          rate: `${s.rate}%`
        });

        // Highlights for rate cell
        const rateCell = row.getCell('rate');
        if (s.rate >= 70) {
          rateCell.font = { color: { argb: '16A34A' }, bold: true }; // Success Green
        } else if (s.rate < 40 && s.total > 0) {
          rateCell.font = { color: { argb: 'DC2626' }, bold: true }; // Failure Red
        }
      });

      worksheet.views = [{ showGridLines: true }];

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=booqasho_staff_kpi_${new Date().toISOString().split('T')[0]}.xlsx`);

      await workbook.xlsx.write(res);
      res.end();

      // Create Audit Log
      await db.auditLogs.create({
        user_id: req.user.id,
        action: 'EXPORT_PERFORMANCE_EXCEL',
        description: `Exported Excel sheet with KPI performance stats of ${staffPerf.length} employees.`
      });

    } else {
      // Export visits report
      const visits = await fetchFilteredVisits(req);
      const worksheet = workbook.addWorksheet('Visits Report');

      // Define columns
      worksheet.columns = [
        { header: 'Visit ID', key: 'id', width: 15 },
        { header: 'Marketing Employee', key: 'employee_name', width: 25 },
        { header: 'Place Name', key: 'place_name', width: 25 },
        { header: 'Place Type', key: 'place_type', width: 15 },
        { header: 'Address', key: 'address', width: 30 },
        { header: 'Contact Person', key: 'contact_person', width: 20 },
        { header: 'Phone Number', key: 'phone', width: 18 },
        { header: 'Visit Date', key: 'visit_date', width: 15 },
        { header: 'Visit Time', key: 'visit_time', width: 12 },
        { header: 'Purpose', key: 'purpose', width: 25 },
        { header: 'Activities', key: 'activities', width: 35 },
        { header: 'Status', key: 'status', width: 15 },
        { header: 'Result Details', key: 'result', width: 30 },
        { header: 'Comments', key: 'comments', width: 30 }
      ];

      // Format Header Row (Sleek Slate Corporate Color)
      const headerRow = worksheet.getRow(1);
      headerRow.eachCell((cell) => {
        cell.font = { bold: true, color: { argb: 'FFFFFF' }, name: 'Segoe UI', size: 11 };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: '0F172A' } // Dark Slate
        };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      });
      headerRow.height = 30;

      // Add rows
      visits.forEach((v) => {
        const row = worksheet.addRow({
          id: v.id,
          employee_name: v.employee_name || 'Marketing Staff',
          place_name: v.place_name,
          place_type: v.place_type,
          address: v.address,
          contact_person: v.contact_person,
          phone: v.phone,
          visit_date: v.visit_date,
          visit_time: v.visit_time,
          purpose: v.purpose,
          activities: v.activities,
          status: v.status,
          result: v.result,
          comments: v.comments
        });

        // Style cell colors based on status
        const statusCell = row.getCell('status');
        if (v.status === 'Successful') {
          statusCell.font = { color: { argb: '16A34A' }, bold: true };
        } else if (v.status === 'Failed') {
          statusCell.font = { color: { argb: 'DC2626' }, bold: true };
        } else {
          statusCell.font = { color: { argb: 'D97706' }, bold: true };
        }
      });

      worksheet.views = [{ showGridLines: true }];

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=booqasho_visits_${new Date().toISOString().split('T')[0]}.xlsx`);

      await workbook.xlsx.write(res);
      res.end();

      // Create Audit Log
      await db.auditLogs.create({
        user_id: req.user.id,
        action: 'EXPORT_EXCEL',
        description: `Exported Excel sheet with ${visits.length} visit logs.`
      });
    }
  } catch (error) {
    console.error('Excel Export Error:', error);
    res.status(500).json({ success: false, message: 'Failed to create Excel file.' });
  }
};

// Export to CSV format
exports.exportCSV = async (req, res) => {
  try {
    const type = req.query.type || 'visits';

    // Helper to sanitize cell values containing commas/newlines
    const escapeCsv = (val) => {
      if (val === undefined || val === null) return '';
      const str = String(val);
      if (str.includes(',') || str.includes('\n') || str.includes('"')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    if (type === 'performance') {
      const staffPerf = await fetchStaffPerformance(req);

      // CSV Header row
      let csvContent = 'Staff ID,Employee Name,Email Address,Total Visits,Successful Visits,Failed Visits,Pending Visits,Success Rate (%)\n';

      staffPerf.forEach((s) => {
        csvContent += [
          escapeCsv(s.id),
          escapeCsv(s.name),
          escapeCsv(s.email),
          escapeCsv(s.total),
          escapeCsv(s.success),
          escapeCsv(s.failed),
          escapeCsv(s.pending),
          escapeCsv(`${s.rate}%`)
        ].join(',') + '\n';
      });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=booqasho_staff_kpi_${new Date().toISOString().split('T')[0]}.csv`);
      res.send(csvContent);

      // Create Audit Log
      await db.auditLogs.create({
        user_id: req.user.id,
        action: 'EXPORT_PERFORMANCE_CSV',
        description: `Exported CSV sheet with KPI performance stats of ${staffPerf.length} employees.`
      });

    } else {
      // Export visits list
      const visits = await fetchFilteredVisits(req);

      let csvContent = 'Visit ID,Employee Name,Place Name,Place Type,Address,Contact Person,Phone,Date,Time,Purpose,Status,Result\n';

      visits.forEach((v) => {
        csvContent += [
          escapeCsv(v.id),
          escapeCsv(v.employee_name),
          escapeCsv(v.place_name),
          escapeCsv(v.place_type),
          escapeCsv(v.address),
          escapeCsv(v.contact_person),
          escapeCsv(v.phone),
          escapeCsv(v.visit_date),
          escapeCsv(v.visit_time),
          escapeCsv(v.purpose),
          escapeCsv(v.status),
          escapeCsv(v.result)
        ].join(',') + '\n';
      });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=booqasho_visits_${new Date().toISOString().split('T')[0]}.csv`);
      res.send(csvContent);

      // Create Audit Log
      await db.auditLogs.create({
        user_id: req.user.id,
        action: 'EXPORT_CSV',
        description: `Exported CSV sheet with ${visits.length} visit logs.`
      });
    }
  } catch (error) {
    console.error('CSV Export Error:', error);
    res.status(500).json({ success: false, message: 'Failed to create CSV file.' });
  }
};
