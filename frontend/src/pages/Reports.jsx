import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../utils/api';

export default function Reports() {
  const { apiRequest, token } = useAuth();
  
  const [employees, setEmployees] = useState([]);
  const [reportType, setReportType] = useState('visits');
  const [format, setFormat] = useState('excel');
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  
  // Filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState('All');
  const [employeeId, setEmployeeId] = useState('All');

  useEffect(() => {
    apiRequest('/users')
      .then(res => {
        if (res.success) {
          setEmployees(res.data.filter(u => u.role === 'marketing'));
        }
      })
      .catch(() => {});
  }, []);

  const handleGeneratePreview = async (e) => {
    e.preventDefault();
    try {
      setLoading(true); 
      setAlert(null); 
      setPreviewData(null);
      
      const query = new URLSearchParams({ 
        type: reportType, 
        status, 
        startDate, 
        endDate 
      });
      if (employeeId !== 'All') query.append('employee_id', employeeId);
      
      const res = await apiRequest(`/reports/preview?${query.toString()}`);
      if (res.success) {
        setPreviewData(res.data);
      }
    } catch (err) {
      setAlert({ 
        type: 'danger', 
        message: 'Failed to generate report preview. Please check your network and database connection.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      setAlert({ type: 'info', message: 'Preparing document download, please wait...' });
      const query = new URLSearchParams({ 
        type: reportType, 
        status, 
        startDate, 
        endDate 
      });
      if (employeeId !== 'All') query.append('employee_id', employeeId);
      
      const response = await fetch(`${API_URL}/reports/export/${format}?${query.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Export failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Hormuud_${reportType}_Report_${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : 'csv'}`;
      document.body.appendChild(a); 
      a.click(); 
      a.remove(); 
      window.URL.revokeObjectURL(url);
      
      setAlert({ type: 'success', message: 'Document exported and downloaded successfully!' });
    } catch (error) {
      setAlert({ type: 'danger', message: 'Failed to export the requested report. Please try again.' });
    }
  };

  return (
    <div className="row g-4">
      {/* Configuration Column */}
      <div className="col-12 col-lg-5 col-xl-4">
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden" style={{ background: 'var(--bs-card-bg)' }}>
          <div className="card-header border-0 bg-transparent pt-4 pb-0">
            <h5 className="fw-bold mb-1">Export Reports</h5>
            <p className="text-body-secondary small mb-0">Filter and export field marketing stats from the secure ledger.</p>
          </div>
          <div className="card-body p-4">
            {alert && (
              <div className={`alert alert-${alert.type} alert-dismissible fade show d-flex align-items-center gap-2 py-2 small rounded-3`} role="alert">
                <i className={`bi ${alert.type === 'success' ? 'bi-check-circle-fill' : alert.type === 'danger' ? 'bi-exclamation-triangle-fill' : 'bi-info-circle-fill'}`}></i>
                <div className="flex-grow-1">{alert.message}</div>
                <button type="button" className="btn-close btn-sm" onClick={() => setAlert(null)}></button>
              </div>
            )}

            <form onSubmit={handleGeneratePreview}>
              <div className="mb-4">
                <label className="form-label small fw-semibold text-body-secondary">Report Type</label>
                <div className="d-flex flex-column gap-2">
                  <label className={`format-option card px-3 py-2 border rounded-3 ${reportType === 'visits' ? 'active' : ''}`} style={{ cursor: 'pointer' }}>
                    <div className="form-check mb-0">
                      <input 
                        className="form-check-input" 
                        type="radio" 
                        name="reportType" 
                        checked={reportType === 'visits'} 
                        onChange={() => {
                          setReportType('visits');
                          setPreviewData(null);
                        }} 
                      />
                      <span className="form-check-label fw-semibold small">
                        <i className="bi bi-geo-alt-fill text-primary me-2"></i>All Visits Log
                      </span>
                    </div>
                  </label>
                  <label className={`format-option card px-3 py-2 border rounded-3 ${reportType === 'performance' ? 'active' : ''}`} style={{ cursor: 'pointer' }}>
                    <div className="form-check mb-0">
                      <input 
                        className="form-check-input" 
                        type="radio" 
                        name="reportType" 
                        checked={reportType === 'performance'} 
                        onChange={() => {
                          setReportType('performance');
                          setPreviewData(null);
                        }} 
                      />
                      <span className="form-check-label fw-semibold small">
                        <i className="bi bi-graph-up-arrow text-primary me-2"></i>Staff Performance (KPIs)
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-body-secondary">Date Range (Timeline)</label>
                <div className="row g-2">
                  <div className="col-6">
                    <input 
                      type="date" 
                      className="form-control form-control-sm rounded-2 bg-light-subtle" 
                      value={startDate} 
                      onChange={e => {
                        setStartDate(e.target.value);
                        setPreviewData(null);
                      }} 
                    />
                  </div>
                  <div className="col-6">
                    <input 
                      type="date" 
                      className="form-control form-control-sm rounded-2 bg-light-subtle" 
                      value={endDate} 
                      onChange={e => {
                        setEndDate(e.target.value);
                        setPreviewData(null);
                      }} 
                    />
                  </div>
                </div>
              </div>

              {reportType === 'visits' && (
                <div className="mb-3">
                  <label className="form-label small fw-semibold text-body-secondary">Outcome Status</label>
                  <select 
                    className="form-select form-select-sm rounded-2 bg-light-subtle" 
                    value={status} 
                    onChange={e => {
                      setStatus(e.target.value);
                      setPreviewData(null);
                    }}
                  >
                    <option value="All">All Outcomes</option>
                    <option value="Successful">Successful Only</option>
                    <option value="Failed">Failed Only</option>
                    <option value="Pending">Pending Only</option>
                  </select>
                </div>
              )}

              <div className="mb-4">
                <label className="form-label small fw-semibold text-body-secondary">Marketing Employee</label>
                <select 
                  className="form-select form-select-sm rounded-2 bg-light-subtle" 
                  value={employeeId} 
                  onChange={e => {
                    setEmployeeId(e.target.value);
                    setPreviewData(null);
                  }}
                >
                  <option value="All">All Employees</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.full_name}</option>
                  ))}
                </select>
              </div>

              <button type="submit" className="btn btn-primary w-100 fw-bold rounded-3 py-2 shadow-sm d-flex align-items-center justify-content-center gap-2" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    Generating Preview...
                  </>
                ) : (
                  <>
                    <i className="bi bi-eye-fill"></i>
                    See Preview
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Preview Column */}
      <div className="col-12 col-lg-7 col-xl-8">
        <div className="card border-0 shadow-sm h-100 rounded-4 overflow-hidden" style={{ background: 'var(--bs-card-bg)' }}>
          <div className="card-header border-0 bg-transparent pt-4 pb-0 d-flex flex-wrap gap-3 justify-content-between align-items-center">
            <h5 className="fw-bold mb-0">Data Preview</h5>
            <div className="d-flex gap-2 bg-body-tertiary p-1 rounded-pill">
              <button 
                className={`btn btn-sm rounded-pill px-3 fw-bold transition-all ${format === 'excel' ? 'btn-success text-white shadow-sm' : 'btn-light border-0'}`} 
                onClick={() => setFormat('excel')}
              >
                <i className="bi bi-file-earmark-excel-fill me-1"></i> Excel
              </button>
              <button 
                className={`btn btn-sm rounded-pill px-3 fw-bold transition-all ${format === 'csv' ? 'btn-secondary text-white shadow-sm' : 'btn-light border-0'}`} 
                onClick={() => setFormat('csv')}
              >
                <i className="bi bi-filetype-csv me-1"></i> CSV
              </button>
            </div>
          </div>
          <div className="card-body p-4 d-flex flex-column justify-content-center align-items-center min-h-[300px]">
            {!previewData && !loading && (
              <div className="m-auto text-center py-5">
                <i className="bi bi-file-earmark-bar-graph text-body-tertiary" style={{ fontSize: '4.5rem' }}></i>
                <p className="text-body-secondary mt-3 fw-semibold max-w-[400px] mx-auto">
                  Click "See Preview" to calculate and inspect matching records before downloading the sheet file.
                </p>
              </div>
            )}
            
            {loading && (
              <div className="m-auto text-center py-5">
                <div className="spinner-border text-primary" style={{ width: '3.5rem', height: '3.5rem' }} role="status">
                  <span className="visually-hidden">Calculating records...</span>
                </div>
              </div>
            )}

            {previewData && !loading && (
              <div className="d-flex flex-column align-items-center justify-content-center flex-grow-1 text-center py-5 animation-fade-in w-100">
                <div className="preview-number mb-2">{previewData.totalRecords}</div>
                <h4 className="fw-bold mb-1">Records Found & Ready to Export</h4>
                <p className="text-body-secondary small mb-4 px-3">
                  {reportType === 'visits' 
                    ? 'Contains complete marketing visit logs, establishment details, timeline parameters, and contact outcomes.' 
                    : 'Contains comprehensive marketing staff KPI scorecard performance data.'
                  }
                </p>
                <button 
                  onClick={handleExport} 
                  className="btn btn-primary btn-lg d-flex align-items-center gap-2 px-5 py-3 rounded-pill shadow-sm hover-lift fw-bold"
                >
                  <i className="bi bi-cloud-arrow-down-fill fs-5"></i>
                  <span>Download Report File</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
