import React, { useState } from 'react';
import { apiFetch } from '../utils/api';
import { useTranslation } from 'react-i18next';
import HormuudLogo from '../components/HormuudLogo';
import AppFooter from '../components/AppFooter';

export default function Register({ onNavigateToLogin }) {
  const { t, i18n } = useTranslation();
  
  const [step, setStep] = useState(1); // 1 = Form, 2 = OTP
  const [formData, setFormData] = useState({ full_name: '', email: '', phone: '', address: '', password: '' });
  const [otp, setOtp] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAlert(null);
    try {
      const { response, data } = await apiFetch('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (response.ok && data?.success) {
        setAlert({ type: 'success', message: data.message });
        setStep(2);
      } else {
        setAlert({ type: 'danger', message: data?.message || 'Registration failed.' });
      }
    } catch (err) {
      setAlert({ type: 'danger', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAlert(null);
    try {
      const { response, data } = await apiFetch('/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: formData.phone, otp_code: otp })
      });
      if (response.ok && data?.success) {
        setAlert({ type: 'success', message: data.message });
        setTimeout(() => {
          onNavigateToLogin();
        }, 2000);
      } else {
        setAlert({ type: 'danger', message: data?.message || 'Invalid OTP.' });
      }
    } catch (err) {
      setAlert({ type: 'danger', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="preauth-wrapper">
      {/* Animated Glowing Spheres */}
      <div className="ambient-glow-sphere sphere-green"></div>
      <div className="ambient-glow-sphere sphere-blue"></div>
      
      {/* Network Grid Overlay */}
      <div className="preauth-grid-overlay"></div>

      {/* Left Column Showcase */}
      <div className="preauth-showcase">
        <div className="showcase-badge">
          <i className="bi bi-shield-check-fill me-1"></i> Booqasho Portal V2.0
        </div>
        <h1 className="showcase-title">
          Nidaamka Booqashada <span>Marketing-ka</span> ee Hormuud
        </h1>
        <p className="showcase-subtitle text-body-secondary">
          Maamul oo la soco dhammaan booqashooyinka shaqaalaha suuqgeynta iyo macaamiisha meel kasta oo aad joogto. Ku hubi shaqada GPS dhab ah, SMS koodh xaqiijin dhab ah, iyo warbixinno dhammaystiran oo KPI ah.
        </p>

        <div className="showcase-features-grid">
          <div className="showcase-feature-card">
            <div className="feature-icon-box bg-success-subtle text-success">
              <i className="bi bi-geo-alt-fill"></i>
            </div>
            <h5 className="text-body-emphasis">GPS Verification</h5>
            <p className="text-body-secondary">Cabbir sax ah oo goobta booqashada iyo xaqiijinta dhabta ah ee wakiilka.</p>
          </div>

          <div className="showcase-feature-card">
            <div className="feature-icon-box bg-primary-subtle text-primary">
              <i className="bi bi-chat-left-text-fill"></i>
            </div>
            <h5 className="text-body-emphasis">SMS Verification</h5>
            <p className="text-body-secondary">Koodhka xaqiijinta macaamiisha oo ku xiran Hormuud SMS Gateway.</p>
          </div>

          <div className="showcase-feature-card">
            <div className="feature-icon-box bg-info-subtle text-info">
              <i className="bi bi-bar-chart-line-fill"></i>
            </div>
            <h5 className="text-body-emphasis">Real-Time Reports</h5>
            <p className="text-body-secondary">Warbixinno falanqayn ah iyo cabbirka KPI-yada shaqaalaha.</p>
          </div>

          <div className="showcase-feature-card">
            <div className="feature-icon-box bg-warning-subtle text-warning">
              <i className="bi bi-shield-fill-check"></i>
            </div>
            <h5 className="text-body-emphasis">Secure Audit Logs</h5>
            <p className="text-body-secondary">Diiwaanka dhammaan falalka muhiimka ah si loo sugo amniga nidaamka.</p>
          </div>
        </div>
      </div>

      {/* Right Column Form */}
      <div className="preauth-form-side">
        <div className="preauth-glass-card">
          {/* Language Selector */}
          <div className="lang-selector-preauth">
            <button
              type="button"
              className={`btn-lang ${i18n.language === 'so' ? 'active' : ''}`}
              onClick={() => i18n.changeLanguage('so')}
            >
              SO
            </button>
            <button
              type="button"
              className={`btn-lang ${i18n.language === 'en' ? 'active' : ''}`}
              onClick={() => i18n.changeLanguage('en')}
            >
              EN
            </button>
          </div>

          {/* Logo */}
          <div className="text-center mb-4 mt-2">
            <div className="d-flex justify-content-center mb-3">
              <HormuudLogo size={60} showText={true} />
            </div>
          </div>

          {alert && (
            <div className={`alert alert-${alert.type} small d-flex align-items-center gap-2`} role="alert">
              <i className={`bi ${alert.type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'}`}></i>
              {alert.message}
            </div>
          )}

          {step === 1 ? (
            <>
              <div className="text-center mb-4">
                <h4 className="fw-bold mb-1 text-body-emphasis">{t('auth.register_title')}</h4>
                <p className="text-body-secondary small mb-0">{t('auth.register_desc')}</p>
              </div>

              <form onSubmit={handleRegister}>
                <div className="mb-3">
                  <label className="form-label">{t('auth.full_name')}</label>
                  <div className="input-group">
                    <span className="input-group-text"><i className="bi bi-person"></i></span>
                    <input type="text" name="full_name" className="form-control" value={formData.full_name} onChange={handleChange} required disabled={loading} />
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label">{t('auth.email')}</label>
                  <div className="input-group">
                    <span className="input-group-text"><i className="bi bi-envelope"></i></span>
                    <input type="email" name="email" className="form-control" value={formData.email} onChange={handleChange} required disabled={loading} />
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label">{t('auth.phone')}</label>
                  <div className="input-group">
                    <span className="input-group-text"><i className="bi bi-telephone"></i></span>
                    <input type="tel" name="phone" className="form-control" placeholder="+25261XXXXXXX" value={formData.phone} onChange={handleChange} required disabled={loading} />
                  </div>
                  <small className="text-body-secondary">{t('auth.phone_otp_hint')}</small>
                </div>
                <div className="mb-3">
                  <label className="form-label">{t('auth.address')}</label>
                  <div className="input-group">
                    <span className="input-group-text"><i className="bi bi-geo-alt"></i></span>
                    <input type="text" name="address" className="form-control" placeholder="e.g., Hodan District, Mogadishu" value={formData.address} onChange={handleChange} required disabled={loading} />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="form-label">{t('auth.password')}</label>
                  <div className="input-group">
                    <span className="input-group-text"><i className="bi bi-lock"></i></span>
                    <input type="password" name="password" className="form-control" value={formData.password} onChange={handleChange} required minLength="6" disabled={loading} />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary w-100 py-2 mb-3" disabled={loading}>
                  {loading ? <span className="spinner-border spinner-border-sm"></span> : t('auth.register_new')}
                </button>

                <div className="text-center">
                  <button type="button" className="btn btn-link text-decoration-none small fw-bold text-primary" onClick={onNavigateToLogin}>
                    <i className="bi bi-arrow-left me-1"></i> {t('auth.back')}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <>
              <div className="text-center mb-4">
                <div className="mb-3">
                  <div className="d-inline-flex align-items-center justify-content-center bg-primary-subtle text-primary rounded-circle" style={{ width: 64, height: 64, fontSize: '2rem' }}>
                    <i className="bi bi-chat-left-dots-fill"></i>
                  </div>
                </div>
                <h4 className="fw-bold mb-1 text-body-emphasis">{t('auth.verify_otp_title')}</h4>
                <p className="text-body-secondary small mb-0">{t('auth.verify_otp_desc')}</p>
                <div className="mt-2 fw-bold text-primary">{formData.phone}</div>
              </div>

              <form onSubmit={handleVerifyOTP}>
                <div className="mb-4">
                  <input type="text" className="form-control text-center fw-bold text-body-emphasis bg-body-tertiary" style={{ letterSpacing: '0.5em', fontSize: '1.5rem' }} placeholder="------" maxLength="6" value={otp} onChange={(e) => setOtp(e.target.value)} required disabled={loading} />
                </div>

                <button type="submit" className="btn btn-primary w-100 py-2 mb-3" disabled={loading || otp.length !== 6}>
                  {loading ? <span className="spinner-border spinner-border-sm"></span> : t('auth.verify_btn')}
                </button>
              </form>
            </>
          )}
        </div>
      </div>

      <AppFooter variant="login" />
    </div>
  );
}
