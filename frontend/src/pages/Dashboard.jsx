import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import Chart from 'chart.js/auto';

export default function Dashboard({ setActivePage }) {
  const { apiRequest, user } = useAuth();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const trendRef = useRef(null);
  const typeRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await apiRequest('/dashboard/stats');
        if (res.success) setStats(res.data);
      } catch (e) {
        setStats({
          role: user?.role || 'marketing',
          summary: { totalVisits: 0, successful: 0, failed: 0, pending: 0, visitsToday: 0, successRate: 0, totalUsers: 0 },
          placeTypeCounts: {},
          recentVisits: [],
          activeStaff: [],
          recentLogs: [],
          trends: []
        });
      } finally { 
        setLoading(false); 
      }
    })();
  }, []);

  useEffect(() => {
    if (!stats || loading) return;
    
    // Trend Line Chart
    if (stats.role === 'admin' && trendRef.current) {
      if (trendRef.current._ci) trendRef.current._ci.destroy();
      const ctx = trendRef.current.getContext('2d');
      const g1 = ctx.createLinearGradient(0, 0, 0, 260); 
      g1.addColorStop(0, 'rgba(60,176,67,0.35)'); 
      g1.addColorStop(1, 'rgba(60,176,67,0)');
      
      const g2 = ctx.createLinearGradient(0, 0, 0, 260); 
      g2.addColorStop(0, 'rgba(239,68,68,0.35)'); 
      g2.addColorStop(1, 'rgba(239,68,68,0)');
      
      trendRef.current._ci = new Chart(ctx, {
        type: 'line',
        data: {
          labels: stats.trends.map(t => t.label),
          datasets: [
            { 
              label: 'Successful', 
              data: stats.trends.map(t => t.success), 
              borderColor: '#3cb043', 
              backgroundColor: g1, 
              fill: true, 
              tension: 0.4, 
              borderWidth: 2.5, 
              pointRadius: 3 
            },
            { 
              label: 'Failed', 
              data: stats.trends.map(t => t.failed), 
              borderColor: '#ef4444', 
              backgroundColor: g2, 
              fill: true, 
              tension: 0.4, 
              borderWidth: 2.5, 
              pointRadius: 3 
            },
          ],
        },
        options: { 
          responsive: true, 
          maintainAspectRatio: false, 
          plugins: { 
            legend: { 
              labels: { 
                color: '#9ca3af', 
                font: { family: 'Inter', weight: '600' } 
              } 
            } 
          }, 
          scales: { 
            x: { 
              grid: { display: false }, 
              ticks: { color: '#9ca3af' } 
            }, 
            y: { 
              grid: { color: 'rgba(128,128,128,0.08)' }, 
              ticks: { color: '#9ca3af', stepSize: 1 } 
            } 
          } 
        },
      });
    }

    // Doughnut / Bar Chart
    if (typeRef.current) {
      if (typeRef.current._ci) typeRef.current._ci.destroy();
      const ctx2 = typeRef.current.getContext('2d');
      if (stats.role === 'admin') {
        typeRef.current._ci = new Chart(ctx2, {
          type: 'doughnut',
          data: { 
            labels: ['Successful', 'Failed', 'Pending'], 
            datasets: [{ 
              data: [stats.summary.successful, stats.summary.failed, stats.summary.pending], 
              backgroundColor: ['rgba(60,176,67,0.7)', 'rgba(239,68,68,0.7)', 'rgba(245,158,11,0.7)'], 
              borderWidth: 0 
            }] 
          },
          options: { 
            responsive: true, 
            maintainAspectRatio: false, 
            cutout: '68%', 
            plugins: { 
              legend: { 
                position: 'bottom', 
                labels: { color: '#9ca3af', boxWidth: 14, padding: 14 } 
              } 
            } 
          },
        });
      } else {
        const labels = Object.keys(stats.placeTypeCounts || {}); 
        const data = Object.values(stats.placeTypeCounts || {});
        typeRef.current._ci = new Chart(ctx2, {
          type: 'bar',
          data: { 
            labels: labels.length ? labels : ['N/A'], 
            datasets: [{ 
              label: 'Establishments Visited', 
              data: data.length ? data : [0], 
              backgroundColor: 'rgba(0,148,212,0.6)', 
              borderColor: '#0094d4', 
              borderWidth: 1, 
              borderRadius: 6 
            }] 
          },
          options: { 
            responsive: true, 
            maintainAspectRatio: false, 
            plugins: { legend: { display: false } }, 
            scales: { 
              x: { 
                grid: { display: false }, 
                ticks: { color: '#9ca3af' } 
              }, 
              y: { 
                grid: { color: 'rgba(128,128,128,0.08)' }, 
                ticks: { color: '#9ca3af', stepSize: 1 } 
              } 
            } 
          },
        });
      }
    }
    return () => { 
      trendRef.current?._ci?.destroy(); 
      typeRef.current?._ci?.destroy(); 
    };
  }, [stats, loading]);

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" style={{ width: '2.5rem', height: '2.5rem' }}></div>
        <p className="mt-3 text-body-secondary">Loading dashboard metrics...</p>
      </div>
    );
  }
  
  if (!stats) {
    return null;
  }

  const s = stats.summary;

  return (
    <div>
      {/* Welcome Banner */}
      <div className="card border-0 mb-4 rounded-4" style={{ background: 'linear-gradient(135deg, rgba(60,176,67,0.08), rgba(0,148,212,0.08))' }}>
        <div className="card-body dashboard-welcome-body py-3 px-4">
          <div className="dashboard-welcome-text">
            <h5 className="fw-bold mb-1">Welcome to Booqasho App!</h5>
            <p className="text-body-secondary small mb-0">Field marketing audit and client engagement dashboard for Hormuud Telecom.</p>
          </div>
          {stats.role === 'marketing' && (
            <button
              type="button"
              onClick={() => setActivePage('add-visit')}
              className="btn btn-primary dashboard-cta-btn shadow-sm"
            >
              <i className="bi bi-plus-circle-fill"></i>
              <span className="dashboard-cta-label-full">{t('dashboard.log_visit_btn')}</span>
              <span className="dashboard-cta-label-short">{t('dashboard.log_visit_btn_short')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="row g-3 mb-4">
        {stats.role === 'admin' ? (
          <>
            <div className="col-6 col-lg-3">
              <div className="card stat-card h-100 border-0 border-start border-3 border-info shadow-sm rounded-3">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start">
                    <span className="stat-title">Employees</span>
                    <div className="stat-icon-box bg-info-subtle text-info rounded-2"><i className="bi bi-people-fill"></i></div>
                  </div>
                  <div className="stat-value mt-2">{s.totalUsers}</div>
                  <div className="stat-label">Marketing staff users</div>
                </div>
              </div>
            </div>
            <div className="col-6 col-lg-3">
              <div className="card stat-card h-100 border-0 border-start border-3 border-primary shadow-sm rounded-3">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start">
                    <span className="stat-title">Field Visits</span>
                    <div className="stat-icon-box bg-primary-subtle text-primary rounded-2"><i className="bi bi-geo-alt-fill"></i></div>
                  </div>
                  <div className="stat-value mt-2">{s.totalVisits}</div>
                  <div className="stat-label">Cumulative total</div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="col-6 col-lg-3">
            <div className="card stat-card h-100 border-0 border-start border-3 border-info shadow-sm rounded-3">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start">
                  <span className="stat-title">My Visits</span>
                  <div className="stat-icon-box bg-info-subtle text-info rounded-2"><i className="bi bi-person-walking"></i></div>
                </div>
                <div className="stat-value mt-2">{s.totalVisits}</div>
                <div className="stat-label">Your logged visits</div>
              </div>
            </div>
          </div>
        )}
        <div className="col-6 col-lg-3">
          <div className="card stat-card h-100 border-0 border-start border-3 border-success shadow-sm rounded-3">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start">
                <span className="stat-title">Successful</span>
                <div className="stat-icon-box bg-success-subtle text-success rounded-2"><i className="bi bi-check-circle-fill"></i></div>
              </div>
              <div className="stat-value mt-2 text-success">{s.successful}</div>
              <div className="stat-label">Completed deals</div>
            </div>
          </div>
        </div>
        <div className="col-6 col-lg-3">
          <div className="card stat-card h-100 border-0 border-start border-3 border-danger shadow-sm rounded-3">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start">
                <span className="stat-title">Failed</span>
                <div className="stat-icon-box bg-danger-subtle text-danger rounded-2"><i className="bi bi-x-circle-fill"></i></div>
              </div>
              <div className="stat-value mt-2 text-danger">{s.failed}</div>
              <div className="stat-label">Rejected / Unsuccessful</div>
            </div>
          </div>
        </div>
        <div className="col-6 col-lg-3">
          <div className="card stat-card h-100 border-0 border-start border-3 border-warning shadow-sm rounded-3">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start">
                <span className="stat-title">Success Rate</span>
                <div className="stat-icon-box bg-warning-subtle text-warning rounded-2"><i className="bi bi-graph-up-arrow"></i></div>
              </div>
              <div className="stat-value mt-2">{s.successRate}%</div>
              <div className="progress progress-hormuud mt-2" style={{ height: 6 }}>
                <div className="progress-bar" style={{ width: `${s.successRate}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="row g-3 mb-4">
        {stats.role === 'admin' ? (
          <>
            <div className="col-lg-7">
              <div className="card border-0 shadow-sm rounded-4 h-100">
                <div className="card-body p-4">
                  <h6 className="fw-bold mb-3">Visit Activity (This Week)</h6>
                  <div className="chart-canvas-wrap">
                    <canvas ref={trendRef}></canvas>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-5">
              <div className="card border-0 shadow-sm rounded-4 h-100">
                <div className="card-body p-4">
                  <h6 className="fw-bold mb-3">Status Distribution</h6>
                  <div className="chart-canvas-wrap">
                    <canvas ref={typeRef}></canvas>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="col-12">
            <div className="card border-0 shadow-sm rounded-4">
              <div className="card-body p-4">
                <h6 className="fw-bold mb-3">Types of Establishments Visited</h6>
                <div className="chart-canvas-wrap">
                  <canvas ref={typeRef}></canvas>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tables */}
      {stats.role === 'admin' ? (
        <div className="row g-3">
          <div className="col-lg-7">
            <div className="card border-0 shadow-sm rounded-4 h-100">
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="fw-bold mb-0">Employee KPI Performance</h6>
                  <button onClick={() => setActivePage('users')} className="btn btn-outline-secondary btn-sm rounded-pill px-3">View All</button>
                </div>
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead>
                      <tr>
                        <th>Employee</th>
                        <th>Visits</th>
                        <th>Successful</th>
                        <th>Success Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.activeStaff.map(st => (
                        <tr key={st.id}>
                          <td className="fw-semibold">{st.name}</td>
                          <td>{st.total}</td>
                          <td className="text-success fw-semibold">{st.success}</td>
                          <td>
                            <span className={`badge rounded-pill ${st.rate >= 70 ? 'badge-successful' : st.rate >= 45 ? 'badge-pending' : 'badge-failed'}`}>
                              {st.rate}%
                            </span>
                          </td>
                        </tr>
                      ))}
                      {!stats.activeStaff.length && (
                        <tr>
                          <td colSpan="4" className="text-center text-body-secondary py-3">No marketing staff recorded.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
          
          <div className="col-lg-5">
            <div className="card border-0 shadow-sm rounded-4 h-100">
              <div className="card-body p-4">
                <h6 className="fw-bold mb-3">Audit Logs</h6>
                <div className="d-flex flex-column" style={{ maxHeight: '350px', overflowY: 'auto' }}>
                  {stats.recentLogs.map(log => (
                    <div key={log.id} className="timeline-item">
                      <div className="timeline-dot"></div>
                      <div className="flex-grow-1">
                        <div className="d-flex justify-content-between">
                          <span className="small fw-bold">{log.full_name || 'System'}</span>
                          <span className="text-body-secondary" style={{ fontSize: '0.7rem' }}>
                            {new Date(log.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <span className="text-info fw-bold" style={{ fontSize: '0.65rem', letterSpacing: '0.04em' }}>{log.action}</span>
                        <p className="text-body-secondary small mb-0">{log.description}</p>
                      </div>
                    </div>
                  ))}
                  {!stats.recentLogs.length && (
                    <p className="text-center text-body-secondary small py-3">No system logs generated yet.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="card border-0 shadow-sm rounded-4">
          <div className="card-body p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="fw-bold mb-0">Recent Field Visits</h6>
              <button onClick={() => setActivePage('visits')} className="btn btn-outline-secondary btn-sm rounded-pill px-3">View All</button>
            </div>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead>
                  <tr>
                    <th>Establishment</th>
                    <th>Type</th>
                    <th>Contact Person</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentVisits.map(v => (
                    <tr key={v.id}>
                      <td className="fw-semibold">{v.place_name}</td>
                      <td>{v.place_type}</td>
                      <td>{v.contact_person}</td>
                      <td>{v.visit_date}</td>
                      <td>
                        <span className={`badge rounded-pill badge-${v.status.toLowerCase()}`}>
                          {v.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {!stats.recentVisits.length && (
                    <tr>
                      <td colSpan="5" className="text-center text-body-secondary py-3">No recent visits recorded.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
