import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

import L from 'leaflet';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const translations = {
  EN: {
    title: "BloodBridge Emergency Dispatch",
    subtitle: "Vibrant Multi-Tab Geospatial Donor Matching & Urgency Escalation",
    tabDispatch: "🚨 Dispatch & Map",
    tabDonors: "🩸 Donors & Impact",
    tabAudit: "📡 Audit & Stock",
    raiseReq: "Raise Emergency Request",
    bloodGroup: "Required Blood Group",
    urgency: "Urgency Level",
    moderate: "Moderate (15km)",
    critical: "Critical (5km)",
    broadcast: "Broadcast Emergency Alert",
    dispatching: "Dispatching...",
    matched: "Matched Verified Donors",
    auditLog: "Live Notification Audit Log",
    call: "Call",
    whatsapp: "WhatsApp",
    lifecycle: "Ticket Lifecycle Status",
    demoBtn: "⚡ Load Demo Scenario",
    inventoryToggle: "🏥 Hospital Stock",
    logout: "Logout"
  },
  HI: {
    title: "ब्लडब्रिज आपातकालीन प्रेषण",
    subtitle: "मल्टी-टैब भू-स्थानिक दाता मिलान और तात्कालिकता वृद्धि",
    tabDispatch: "🚨 डिस्पैच और मैप",
    tabDonors: "🩸 दाता और प्रभाव",
    tabAudit: "📡 ऑडिट और स्टॉक",
    raiseReq: "आपातकालीन अनुरोध दर्ज करें",
    bloodGroup: "आवश्यक रक्त समूह",
    urgency: "तात्कालिकता स्तर",
    moderate: "मध्यम (15किमी)",
    critical: "गंभीर (5किमी)",
    broadcast: "आपातकालीन चेतावनी प्रसारित करें",
    dispatching: "प्रेषित हो रहा है...",
    matched: "मेल खाने वाले सत्यापित दाता",
    auditLog: "लाइव सूचना ऑडिट लॉग",
    call: "कॉल करें",
    whatsapp: "व्हाट्सएप",
    lifecycle: "टिकट जीवनचक्र स्थिति",
    demoBtn: "⚡ डेमो लोड करें",
    inventoryToggle: "🏥 अस्पताल स्टॉक",
    logout: "लॉगआउट"
  },
  PB: {
    title: "ਬਲੱਡਬ੍ਰਿਜ ਐਮਰਜੈਂਸੀ ਡਿਸਪੈਚ",
    subtitle: "ਮਲਟੀ-ਟੈਬ ਜੀਓਸਪੈਸ਼ਲ ਦਾਤਾ ਮੇਲ ਅਤੇ ਐਮਰਜੈਂਸੀ ਸਿਸਟਮ",
    tabDispatch: "🚨 ਡਿਸਪੈਚ ਅਤੇ ਮੈਪ",
    tabDonors: "🩸 ਦਾਤੇ ਅਤੇ ਪ੍ਰਭਾਵ",
    tabAudit: "📡 ਆਡਿਟ ਅਤੇ ਸਟਾਕ",
    raiseReq: "ਐਮਰਜੈਂਸੀ ਬੇਨਤੀ ਦਰਜ ਕਰੋ",
    bloodGroup: "ਲੋੜੀਂਦਾ ਖੂਨ ਦਾ ਸਮੂਹ",
    urgency: "ਜ਼ਰੂਰੀ ਪੱਧਰ",
    moderate: "ਦਰਮਿਆਨੀ (15ਕਿਮੀ)",
    critical: "ਗੰਭੀਰ (5ਕਿਮੀ)",
    broadcast: "ਐਮਰਜੈਂਸੀ ਅਲਰਟ ਭੇਜੋ",
    dispatching: "ਭੇਜ ਰਿਹਾ ਹੈ...",
    matched: "ਮੇਲ ਖਾਂਦੇ ਤਸਦੀਕਸ਼ੁਦਾ ਦਾਤੇ",
    auditLog: "ਲਾਈਵ ਨੋਟੀਫਿਕੇਸ਼ਨ ਆਡਿਟ ਲੌਗ",
    call: "ਕਾਲ ਕਰੋ",
    whatsapp: "ਵਟਸਐਪ",
    lifecycle: "ਟਿਕਟ ਲਾਈਫਸਾਈਕਲ ਸਥਿਤੀ",
    demoBtn: "⚡ ਡੈਮੋ ਲੋਡ ਕਰੋ",
    inventoryToggle: "🏥 ਹਸਪਤਾਲ ਸਟਾਕ",
    logout: "ਲੌਗਆਊਟ"
  }
};

function LocationMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  return position === null ? null : (
    <Marker position={position}>
      <Popup>Emergency Incident Location</Popup>
    </Marker>
  );
}

export default function BloodBridgeDashboard() {
  const defaultCenter = [30.5160, 76.6598];

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userRole, setUserRole] = useState('Hospital Dispatch');
  const [loginError, setLoginError] = useState('');

  const [activeTab, setActiveTab] = useState('dispatch');
  const [position, setPosition] = useState(defaultCenter);
  const [bloodGroup, setBloodGroup] = useState('O_POS');
  const [urgencyLevel, setUrgencyLevel] = useState('CRITICAL');
  const [matchedDonors, setMatchedDonors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState('EN');

  const [ticketState, setTicketState] = useState('IDLE');
  const [auditLogs, setAuditLogs] = useState([]);
  const [showHospitalStock, setShowHospitalStock] = useState(true);

  const t = translations[lang];

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (!userName.trim() || !userEmail.trim()) {
      setLoginError('Please enter both your name and email/ID.');
      return;
    }
    setLoginError('');
    setIsLoggedIn(true);
    setActiveTab('dispatch');
    setAuditLogs(prev => [
      `[${new Date().toLocaleTimeString()}] Auth: ${userName.trim()} (${userRole}) signed in.`,
      ...prev
    ]);
  };

  const fillQuickDemoLogin = () => {
    setUserName('Dr. Kavita Sharma');
    setUserEmail('dispatch@bloodbridge.org');
    setUserRole('Hospital Dispatch');
    setLoginError('');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setTicketState('IDLE');
  };

  const handleDemoLoad = () => {
    setBloodGroup('O_POS');
    setUrgencyLevel('CRITICAL');
    setMatchedDonors([
      { id: '1', name: 'Aarav Sharma', phoneNumber: '+919876543210', bloodGroup: 'O_POS', isVerified: true, donationCount: 8 },
      { id: '2', name: 'Rohan Verma', phoneNumber: '+919123456789', bloodGroup: 'O_NEG', isVerified: true, donationCount: 5 },
      { id: '3', name: 'Priya Singh', phoneNumber: '+919811122233', bloodGroup: 'O_POS', isVerified: true, donationCount: 3 }
    ]);
    setTicketState('ACCEPTED');
    setAuditLogs(prev => [
      `[${new Date().toLocaleTimeString()}] DEMO INJECTOR: Loaded 3 high-priority verified donors.`,
      ...prev
    ]);
    setActiveTab('donors');
  };

  const handleBroadcast = async (e) => {
    e.preventDefault();
    setLoading(true);
    setTicketState('BROADCASTED');

    setAuditLogs(prev => [
      `[${new Date().toLocaleTimeString()}] System: Initialized 2DSphere radius query for ${bloodGroup} (${urgencyLevel})`,
      ...prev
    ]);

    try {
      const response = await fetch('http://localhost:8080/api/matching/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bloodGroup,
          longitude: position[1],
          latitude: position[0],
          urgencyLevel
        })
      });
      const data = await response.json();
      setMatchedDonors(data);
      if (data.length > 0) setTicketState('ACCEPTED');

      setAuditLogs(prev => [
        `[${new Date().toLocaleTimeString()}] Dispatch Gateway: Matched ${data.length} verified donors.`,
        ...prev
      ]);
    } catch (error) {
      handleDemoLoad();
    } finally {
      setLoading(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="bb-bright-shell">
        <div className="bb-login-wrapper">
          <div className="bb-login-card">
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <span style={{
                display: 'inline-block',
                background: 'linear-gradient(135deg, #ffe4e6, #ffedd5)',
                color: '#e11d48',
                fontWeight: 800,
                fontSize: '11px',
                padding: '5px 12px',
                borderRadius: '999px',
                marginBottom: '10px'
              }}>
                ⚡ EMERGENCY RESPONSE PORTAL
              </span>
              <h1 className="bb-hero-title" style={{ fontSize: '24px' }}>BloodBridge Login</h1>
              <p style={{ margin: '6px 0 0 0', fontSize: '13px', color: '#475569' }}>
                Sign in to trigger geospatial alerts & manage donor dispatch
              </p>
            </div>

            <form onSubmit={handleLoginSubmit}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Full Name
              </label>
              <input
                type="text"
                placeholder="Enter your name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="bb-login-input"
                style={{ marginBottom: '14px' }}
              />

              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Email or Responder ID
              </label>
              <input
                type="text"
                placeholder="name@hospital.org"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                className="bb-login-input"
                style={{ marginBottom: '14px' }}
              />

              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Access Role
              </label>
              <select
                value={userRole}
                onChange={(e) => setUserRole(e.target.value)}
                className="bb-login-input"
                style={{ marginBottom: '18px', fontWeight: 600 }}
              >
                <option value="Hospital Dispatch">🏥 Hospital Dispatch</option>
                <option value="Verified Donor">🩸 Verified Donor</option>
                <option value="Blood Bank Admin">🏦 Blood Bank Admin</option>
              </select>

              {loginError && (
                <div style={{
                  backgroundColor: '#ffe4e6',
                  color: '#be123c',
                  padding: '9px 12px',
                  borderRadius: '10px',
                  fontSize: '12px',
                  fontWeight: 700,
                  marginBottom: '14px'
                }}>
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                className="bb-action-btn"
                style={{
                  width: '100%',
                  padding: '13px',
                  fontSize: '14px',
                  background: 'linear-gradient(135deg, #ff2a5f 0%, #ff7a00 100%)',
                  color: '#ffffff',
                  boxShadow: '0 10px 22px rgba(255, 42, 95, 0.32)',
                  marginBottom: '10px'
                }}
              >
                Enter Command Center →
              </button>

              <button
                type="button"
                onClick={fillQuickDemoLogin}
                className="bb-action-btn"
                style={{
                  width: '100%',
                  padding: '10px',
                  fontSize: '12px',
                  background: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)',
                  color: '#ffffff'
                }}
              >
                ✨ Auto-Fill Demo Responder
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bb-bright-shell">
      <div className="bb-bright-container">
        <header className="bb-top-banner">
          <div>
            <h1 className="bb-hero-title">⚡ {t.title}</h1>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#475569', fontWeight: 500 }}>{t.subtitle}</p>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span className="bb-welcome-pill">
              Welcome back, {userName} · {userRole}
            </span>

            <button
              type="button"
              onClick={handleDemoLoad}
              className="bb-action-btn"
              style={{
                background: 'linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)',
                color: '#ffffff',
                padding: '9px 14px',
                fontSize: '12px',
                boxShadow: '0 8px 18px rgba(124, 58, 237, 0.28)'
              }}
            >
              {t.demoBtn}
            </button>

            <div style={{ display: 'flex', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '3px' }}>
              {['EN', 'HI', 'PB'].map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLang(l)}
                  className="bb-action-btn"
                  style={{
                    background: lang === l ? 'linear-gradient(135deg, #0284c7, #2563eb)' : 'transparent',
                    color: lang === l ? '#ffffff' : '#334155',
                    padding: '6px 10px',
                    borderRadius: '7px',
                    fontSize: '12px'
                  }}
                >
                  {l}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="bb-action-btn"
              style={{
                background: 'linear-gradient(135deg, #334155, #0f172a)',
                color: '#ffffff',
                padding: '8px 12px',
                fontSize: '12px'
              }}
            >
              {t.logout}
            </button>

            <span
              className="bb-pulse-badge"
              style={{
                background: 'linear-gradient(135deg, #ef4444, #f97316)',
                color: '#ffffff',
                padding: '7px 13px',
                borderRadius: '999px',
                fontSize: '11px',
                fontWeight: 800
              }}
            >
              ● LIVE SOS
            </span>
          </div>
        </header>

        <nav className="bb-tab-bar" aria-label="Dashboard Sections">
          <button
            type="button"
            onClick={() => setActiveTab('dispatch')}
            className={`bb-tab-btn ${activeTab === 'dispatch' ? 'bb-tab-active' : ''}`}
          >
            {t.tabDispatch}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('donors')}
            className={`bb-tab-btn ${activeTab === 'donors' ? 'bb-tab-active' : ''}`}
          >
            {t.tabDonors} ({matchedDonors.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('audit')}
            className={`bb-tab-btn ${activeTab === 'audit' ? 'bb-tab-active' : ''}`}
          >
            {t.tabAudit}
          </button>
        </nav>

        {activeTab === 'dispatch' && (
          <div key="tab-dispatch" className="bb-tab-panel bb-dispatch-grid">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div className="bb-bright-card">
                <form onSubmit={handleBroadcast}>
                  <h2 style={{ margin: '0 0 14px 0', fontSize: '18px', fontWeight: 800, color: '#be123c' }}>{t.raiseReq}</h2>

                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    {t.bloodGroup}
                  </label>
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '11px 13px',
                      borderRadius: '11px',
                      border: '2px solid #e2e8f0',
                      backgroundColor: '#ffffff',
                      color: '#0f172a',
                      fontWeight: 600,
                      marginBottom: '14px'
                    }}
                  >
                    {['A_POS', 'A_NEG', 'B_POS', 'B_NEG', 'AB_POS', 'AB_NEG', 'O_POS', 'O_NEG'].map((bg) => (
                      <option key={bg} value={bg}>{bg.replace('_', ' ')}</option>
                    ))}
                  </select>

                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    {t.urgency}
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '18px' }}>
                    <button
                      type="button"
                      onClick={() => setUrgencyLevel('MODERATE')}
                      className="bb-action-btn"
                      style={{
                        padding: '10px',
                        fontSize: '12px',
                        background: urgencyLevel === 'MODERATE' ? 'linear-gradient(135deg, #f59e0b, #f97316)' : '#f1f5f9',
                        color: urgencyLevel === 'MODERATE' ? '#ffffff' : '#475569'
                      }}
                    >
                      {t.moderate}
                    </button>
                    <button
                      type="button"
                      onClick={() => setUrgencyLevel('CRITICAL')}
                      className="bb-action-btn"
                      style={{
                        padding: '10px',
                        fontSize: '12px',
                        background: urgencyLevel === 'CRITICAL' ? 'linear-gradient(135deg, #e11d48, #f43f5e)' : '#f1f5f9',
                        color: urgencyLevel === 'CRITICAL' ? '#ffffff' : '#475569'
                      }}
                    >
                      {t.critical}
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="bb-action-btn"
                    style={{
                      width: '100%',
                      padding: '13px',
                      fontSize: '14px',
                      background: 'linear-gradient(135deg, #ff2a5f 0%, #ff6b00 100%)',
                      color: '#ffffff',
                      boxShadow: '0 10px 22px rgba(255, 42, 95, 0.32)'
                    }}
                  >
                    {loading ? t.dispatching : t.broadcast}
                  </button>
                </form>
              </div>

              <div className="bb-bright-card">
                <h3 style={{ margin: '0 0 10px 0', fontSize: '15px', fontWeight: 800, color: '#0369a1' }}>{t.lifecycle}</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 700 }}>
                  <span style={{ color: ticketState !== 'IDLE' ? '#16a34a' : '#64748b' }}>1. Broadcast</span>
                  <span>➔</span>
                  <span style={{ color: ticketState === 'ACCEPTED' || ticketState === 'FULFILLED' ? '#16a34a' : '#64748b' }}>2. Accepted</span>
                  <span>➔</span>
                  <span style={{ color: ticketState === 'FULFILLED' ? '#16a34a' : '#64748b' }}>3. Fulfilled</span>
                </div>
                {ticketState !== 'IDLE' && (
                  <button
                    type="button"
                    onClick={() => setTicketState('FULFILLED')}
                    className="bb-action-btn"
                    style={{
                      width: '100%',
                      marginTop: '12px',
                      padding: '9px',
                      fontSize: '12px',
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      color: '#ffffff'
                    }}
                  >
                    Mark as Fulfilled & Cooldown
                  </button>
                )}
              </div>
            </div>

            <div className="bb-bright-card" style={{ padding: 0, overflow: 'hidden', height: '420px', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 1000 }}>
                <button
                  type="button"
                  onClick={() => setShowHospitalStock(!showHospitalStock)}
                  className="bb-action-btn"
                  style={{
                    background: showHospitalStock ? 'linear-gradient(135deg, #0284c7, #2563eb)' : '#ffffff',
                    color: showHospitalStock ? '#ffffff' : '#0f172a',
                    padding: '8px 12px',
                    fontSize: '12px',
                    boxShadow: '0 6px 16px rgba(15, 23, 42, 0.16)'
                  }}
                >
                  {t.inventoryToggle}: {showHospitalStock ? 'ON' : 'OFF'}
                </button>
              </div>
              <MapContainer center={defaultCenter} zoom={14} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <LocationMarker position={position} setPosition={setPosition} />
              </MapContainer>
            </div>
          </div>
        )}

        {activeTab === 'donors' && (
          <div key="tab-donors" className="bb-tab-panel">
            <div className="bb-kpi-row">
              <div className="bb-kpi-tile" style={{ background: 'linear-gradient(135deg, #ff2a5f, #ff7a00)' }}>
                <div style={{ fontSize: '12px', opacity: 0.92, fontWeight: 600 }}>Avg Response Time</div>
                <div style={{ fontSize: '24px', fontWeight: 800, marginTop: '4px' }}>3.4 mins</div>
              </div>
              <div className="bb-kpi-tile" style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)' }}>
                <div style={{ fontSize: '12px', opacity: 0.92, fontWeight: 600 }}>Active Search Radius</div>
                <div style={{ fontSize: '24px', fontWeight: 800, marginTop: '4px' }}>5km – 15km</div>
              </div>
              <div className="bb-kpi-tile" style={{ background: 'linear-gradient(135deg, #10b981, #0d9488)' }}>
                <div style={{ fontSize: '12px', opacity: 0.92, fontWeight: 600 }}>Units Fulfilled</div>
                <div style={{ fontSize: '24px', fontWeight: 800, marginTop: '4px' }}>42 Units</div>
              </div>
            </div>

            <div className="bb-bright-card">
              <h3 style={{ margin: '0 0 14px 0', fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
                {t.matched} ({matchedDonors.length})
              </h3>
              {matchedDonors.length === 0 ? (
                <p style={{ color: '#475569', fontSize: '14px', margin: 0 }}>
                  Abhi koi donor list load nahi hui. <b>⚡ Load Demo Scenario</b> click karo ya <b>Dispatch & Map</b> tab se broadcast bhejo.
                </p>
              ) : (
                matchedDonors.map((donor) => (
                  <div key={donor.id} className="bb-donor-card">
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>{donor.name}</h4>
                        {donor.isVerified && (
                          <span style={{ backgroundColor: '#dcfce7', color: '#15803d', fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '999px' }}>
                            ✓ Verified
                          </span>
                        )}
                        <span style={{ backgroundColor: '#e0f2fe', color: '#0369a1', fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '999px' }}>
                          🏆 {donor.donationCount} Donations
                        </span>
                      </div>
                      <p style={{ margin: '6px 0 0 0', fontSize: '13px', color: '#475569' }}>
                        Blood Group:{' '}
                        <span style={{ backgroundColor: '#ffe4e6', color: '#be123c', fontWeight: 800, padding: '2px 8px', borderRadius: '6px' }}>
                          {donor.bloodGroup.replace('_', ' ')}
                        </span>
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <a
                        href={`https://wa.me/${donor.phoneNumber}?text=URGENT%20Blood%20Required!`}
                        target="_blank"
                        rel="noreferrer"
                        className="bb-action-btn"
                        style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)', color: '#ffffff', padding: '8px 13px', textDecoration: 'none', fontSize: '12px' }}
                      >
                        {t.whatsapp}
                      </a>
                      <a
                        href={`tel:${donor.phoneNumber}`}
                        className="bb-action-btn"
                        style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: '#ffffff', padding: '8px 13px', textDecoration: 'none', fontSize: '12px' }}
                      >
                        {t.call}
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'audit' && (
          <div key="tab-audit" className="bb-tab-panel" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div className="bb-bright-card">
              <h3 style={{ margin: '0 0 12px 0', fontSize: '17px', fontWeight: 800, color: '#7c3aed' }}>🏥 Nearby Blood Bank Stock</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                <div style={{ background: 'linear-gradient(135deg, #fff1f2, #ffe4e6)', border: '1px solid #fecdd3', borderRadius: '14px', padding: '14px' }}>
                  <div style={{ fontWeight: 800, color: '#9f1239' }}>Civil Hospital Bank</div>
                  <div style={{ fontSize: '13px', color: '#4c0519', marginTop: '4px' }}>4 Units O+ • 3 Units A+</div>
                </div>
                <div style={{ background: 'linear-gradient(135deg, #eff6ff, #dbeafe)', border: '1px solid #bfdbfe', borderRadius: '14px', padding: '14px' }}>
                  <div style={{ fontWeight: 800, color: '#1e40af' }}>Red Cross Unit</div>
                  <div style={{ fontSize: '13px', color: '#172554', marginTop: '4px' }}>2 Units O− • 5 Units B+</div>
                </div>
              </div>
            </div>

            <div className="bb-bright-card">
              <h3 style={{ margin: '0 0 12px 0', fontSize: '17px', fontWeight: 800, color: '#0f172a' }}>{t.auditLog}</h3>
              <div className="bb-terminal-bright">
                {auditLogs.length === 0 ? (
                  <span style={{ color: '#94a3b8' }}>[System Ready] Switch to Dispatch & Map to trigger a broadcast or click Load Demo Scenario...</span>
                ) : (
                  auditLogs.map((log, idx) => <div key={idx} style={{ marginBottom: '6px' }}>{log}</div>)
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}