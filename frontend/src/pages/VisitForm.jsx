import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function VisitForm({ setActivePage }) {
  const { user, apiRequest } = useAuth();
  
  const [formData, setFormData] = useState({
    place_name: '', 
    place_type: 'Shop', 
    address: '', 
    contact_person: '', 
    phone: '',
    visit_date: new Date().toISOString().split('T')[0], 
    visit_time: new Date().toTimeString().substring(0,5),
    purpose: '', 
    activities: '', 
    result: '', 
    comments: '', 
    status: 'Pending'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState(null);

  // Focus effect for the first input
  useEffect(() => {
    const el = document.getElementById('place_name');
    if(el) el.focus();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.place_name || !formData.visit_date) {
      setAlert({ type: 'danger', message: 'Please fill in all required fields (Place Name & Visit Date).' });
      return;
    }
    try {
      setIsSubmitting(true);
      setAlert(null);
      const res = await apiRequest('/visits', { method: 'POST', body: JSON.stringify(formData) });
      if (res.success) {
        setAlert({ type: 'success', message: 'Visit logged successfully in the database!' });
        setTimeout(() => setActivePage('visits'), 1500);
      }
    } catch (e) {
      setAlert({ type: 'danger', message: 'An error occurred while saving the visit. Please check your database connection.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card shadow-lg border-0 rounded-4 overflow-hidden mb-4">
      {/* Header section with refined gradient */}
      <div className="card-header border-0 py-4 px-4 px-md-5" style={{ background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)' }}>
        <div className="d-flex align-items-center gap-3">
          <div className="p-3 bg-white bg-opacity-10 rounded-3 text-white">
            <i className="bi bi-journal-plus fs-3"></i>
          </div>
          <div>
            <h4 className="fw-bold text-white mb-1">Register New Visit</h4>
            <p className="text-white-50 small mb-0">Record field marketing data and client engagement statistics to the secure PostgreSQL ledger.</p>
          </div>
        </div>
      </div>
      
      <div className="card-body p-4 p-md-5">
        {alert && (
          <div className={`alert alert-${alert.type} alert-dismissible fade show border-0 shadow-sm rounded-3 py-3 px-4 d-flex align-items-center gap-3 mb-4`} role="alert">
            <i className={`bi ${alert.type === 'success' ? 'bi-check-circle-fill text-success fs-4' : 'bi-exclamation-triangle-fill text-danger fs-4'}`}></i>
            <div className="flex-grow-1">{alert.message}</div>
            <button type="button" className="btn-close" onClick={() => setAlert(null)} aria-label="Close"></button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="needs-validation">
          {/* Section 1: Place / Store Information */}
          <div className="form-section-card">
            <h5 className="fw-bold text-primary mb-4 d-flex align-items-center gap-2">
              <span className="p-2 bg-primary bg-opacity-10 rounded-3 text-primary d-inline-flex"><i className="bi bi-shop"></i></span>
              <span>1. Location & Store Details</span>
            </h5>
            <div className="row g-4">
              <div className="col-md-8">
                <label htmlFor="place_name" className="form-label small fw-bold text-secondary">Establishment / Store Name <span className="text-danger">*</span></label>
                <div className="input-group">
                  <span className="input-group-text border-end-0"><i className="bi bi-building text-muted"></i></span>
                  <input 
                    type="text" 
                    className="form-control border-start-0 ps-0" 
                    id="place_name" 
                    name="place_name" 
                    value={formData.place_name} 
                    onChange={handleChange} 
                    placeholder="e.g., Barwaaqo Supermarket" 
                    required 
                  />
                </div>
              </div>
              <div className="col-md-4">
                <label htmlFor="place_type" className="form-label small fw-bold text-secondary">Establishment Type</label>
                <div className="input-group">
                  <span className="input-group-text border-end-0"><i className="bi bi-tag text-muted"></i></span>
                  <select 
                    className="form-select border-start-0 ps-0" 
                    id="place_type" 
                    name="place_type" 
                    value={formData.place_type} 
                    onChange={handleChange}
                  >
                    <option value="Shop">Shop / Retailer</option>
                    <option value="Business">Medium Business</option>
                    <option value="Company">Enterprise / Company</option>
                    <option value="School">School / University</option>
                    <option value="Hospital">Hospital / Pharmacy</option>
                    <option value="Restaurant">Restaurant / Cafe</option>
                    <option value="Other">Other Category</option>
                  </select>
                </div>
              </div>
              <div className="col-12">
                <label htmlFor="address" className="form-label small fw-bold text-secondary">Physical Address (District / Area)</label>
                <div className="input-group">
                  <span className="input-group-text border-end-0"><i className="bi bi-geo-alt text-muted"></i></span>
                  <input 
                    type="text" 
                    className="form-control border-start-0 ps-0" 
                    id="address" 
                    name="address" 
                    value={formData.address} 
                    onChange={handleChange} 
                    placeholder="e.g., Hodan District, near KM4 intersection" 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Contact Information */}
          <div className="form-section-card">
            <h5 className="fw-bold text-primary mb-4 d-flex align-items-center gap-2">
              <span className="p-2 bg-primary bg-opacity-10 rounded-3 text-primary d-inline-flex"><i className="bi bi-person-badge"></i></span>
              <span>2. Key Contact Person</span>
            </h5>
            <div className="row g-4">
              <div className="col-md-6">
                <label htmlFor="contact_person" className="form-label small fw-bold text-secondary">Client Full Name (Contact Person)</label>
                <div className="input-group">
                  <span className="input-group-text border-end-0"><i className="bi bi-person text-muted"></i></span>
                  <input 
                    type="text" 
                    className="form-control border-start-0 ps-0" 
                    id="contact_person" 
                    name="contact_person" 
                    value={formData.contact_person} 
                    onChange={handleChange} 
                    placeholder="e.g., Ahmed Jama" 
                  />
                </div>
              </div>
              <div className="col-md-6">
                <label htmlFor="phone" className="form-label small fw-bold text-secondary">Client Phone Number</label>
                <div className="input-group">
                  <span className="input-group-text border-end-0"><i className="bi bi-telephone text-muted"></i></span>
                  <input 
                    type="tel" 
                    className="form-control border-start-0 ps-0" 
                    id="phone" 
                    name="phone" 
                    value={formData.phone} 
                    onChange={handleChange} 
                    placeholder="e.g., 061XXXXXXX" 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Timeline & Status */}
          <div className="form-section-card">
            <h5 className="fw-bold text-primary mb-4 d-flex align-items-center gap-2">
              <span className="p-2 bg-primary bg-opacity-10 rounded-3 text-primary d-inline-flex"><i className="bi bi-calendar2-event"></i></span>
              <span>3. Visit Outcome & Status</span>
            </h5>
            <div className="row g-4">
              <div className="col-md-4">
                <label htmlFor="visit_date" className="form-label small fw-bold text-secondary">Date of Visit <span className="text-danger">*</span></label>
                <div className="input-group">
                  <span className="input-group-text border-end-0"><i className="bi bi-calendar-event text-muted"></i></span>
                  <input 
                    type="date" 
                    className="form-control border-start-0 ps-0" 
                    id="visit_date" 
                    name="visit_date" 
                    value={formData.visit_date} 
                    onChange={handleChange} 
                    required 
                  />
                </div>
              </div>
              <div className="col-md-4">
                <label htmlFor="visit_time" className="form-label small fw-bold text-secondary">Time of Visit</label>
                <div className="input-group">
                  <span className="input-group-text border-end-0"><i className="bi bi-clock text-muted"></i></span>
                  <input 
                    type="time" 
                    className="form-control border-start-0 ps-0" 
                    id="visit_time" 
                    name="visit_time" 
                    value={formData.visit_time} 
                    onChange={handleChange} 
                  />
                </div>
              </div>
              <div className="col-md-4">
                <label htmlFor="status" className="form-label small fw-bold text-secondary">Outcome Status <span className="text-danger">*</span></label>
                <div className="input-group">
                  <span className="input-group-text border-end-0"><i className="bi bi-info-circle text-muted"></i></span>
                  <select 
                    className="form-select border-start-0 ps-0 fw-semibold" 
                    id="status" 
                    name="status" 
                    value={formData.status} 
                    onChange={handleChange} 
                    required
                  >
                    <option value="Pending" className="text-warning fw-bold">⏳ Pending (Follow-up)</option>
                    <option value="Successful" className="text-success fw-bold">✅ Successful (Completed)</option>
                    <option value="Failed" className="text-danger fw-bold">❌ Failed (Rejected)</option>
                  </select>
                </div>
              </div>
              <div className="col-12">
                <label htmlFor="purpose" className="form-label small fw-bold text-secondary">Purpose of Visit</label>
                <div className="input-group">
                  <span className="input-group-text border-end-0"><i className="bi bi-question-circle text-muted"></i></span>
                  <input 
                    type="text" 
                    className="form-control border-start-0 ps-0" 
                    id="purpose" 
                    name="purpose" 
                    value={formData.purpose} 
                    onChange={handleChange} 
                    placeholder="e.g., Introducing new enterprise EVC Plus services and merchant options" 
                  />
                </div>
              </div>
              <div className="col-12">
                <label htmlFor="activities" className="form-label small fw-bold text-secondary">Activities Performed</label>
                <textarea 
                  className="form-control" 
                  id="activities" 
                  name="activities" 
                  rows="3" 
                  value={formData.activities} 
                  onChange={handleChange} 
                  placeholder="Detail the conversations, marketing pitches, demonstrations, or materials shared..."
                ></textarea>
              </div>
              <div className="col-12">
                <label htmlFor="result" className="form-label small fw-bold text-secondary">Visit Results & Decisions</label>
                <textarea 
                  className="form-control" 
                  id="result" 
                  name="result" 
                  rows="3" 
                  value={formData.result} 
                  onChange={handleChange} 
                  placeholder="What were the agreements, concerns raised, or decisions made by the client?"
                ></textarea>
              </div>
              <div className="col-12">
                <label htmlFor="comments" className="form-label small fw-bold text-secondary">Additional Internal Comments</label>
                <textarea 
                  className="form-control" 
                  id="comments" 
                  name="comments" 
                  rows="2" 
                  value={formData.comments} 
                  onChange={handleChange} 
                  placeholder="Any other background context, personal observations, or scheduled follow-ups..."
                ></textarea>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="d-flex flex-column flex-sm-row justify-content-stretch justify-content-sm-end align-items-stretch align-items-sm-center gap-3 mt-5 border-top pt-4">
            <button 
              type="button" 
              className="btn btn-light border btn-lg px-4 fs-6 fw-semibold text-secondary rounded-3 w-100 w-sm-auto" 
              onClick={() => setActivePage('visits')} 
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary btn-lg px-5 fs-6 fw-bold rounded-3 shadow-sm d-flex align-items-center justify-content-center gap-2 w-100 w-sm-auto" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Saving data...
                </>
              ) : (
                <>
                  <i className="bi bi-save2-fill"></i>
                  Save Visit Record
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
