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

const BLOOD_GROUPS = ['O_NEG', 'O_POS', 'A_NEG', 'A_POS', 'B_NEG', 'B_POS', 'AB_NEG', 'AB_POS'];

const COMPATIBLE_RECIPIENTS = {
  O_NEG: ['O_NEG', 'O_POS', 'A_NEG', 'A_POS', 'B_NEG', 'B_POS', 'AB_NEG', 'AB_POS'],
  O_POS: ['O_POS', 'A_POS', 'B_POS', 'AB_POS'],
  A_NEG: ['A_NEG', 'A_POS', 'AB_NEG', 'AB_POS'],
  A_POS: ['A_POS', 'AB_POS'],
  B_NEG: ['B_NEG', 'B_POS', 'AB_NEG', 'AB_POS'],
  B_POS: ['B_POS', 'AB_POS'],
  AB_NEG: ['AB_NEG', 'AB_POS'],
  AB_POS: ['AB_POS']
};

function isBloodCompatible(donorGroup, patientGroup) {
  return (COMPATIBLE_RECIPIENTS[donorGroup] || []).includes(patientGroup);
}

function inspectMedicalSignals(donor, patient) {
  const flags = [];
  let suggested = 'SUITABLE';

  if (isBloodCompatible(donor.bloodGroup, patient.bloodGroup)) {
    flags.push({
      ok: true,
      text: donor.bloodGroup === patient.bloodGroup
        ? `Exact Group (${donor.bloodGroup.replace('_', ' ')})`
        : `Compatible (${donor.bloodGroup.replace('_', ' ')} → ${patient.bloodGroup.replace('_', ' ')})`
    });
  } else {
    suggested = 'NOT_SUITABLE';
    flags.push({
      ok: false,
      text: `Incompatible (${donor.bloodGroup.replace('_', ' ')} → ${patient.bloodGroup.replace('_', ' ')})`
    });
  }

  const hb = Number(donor.hemoglobin);
  if (Number.isNaN(hb) || hb < 12.5) {
    suggested = 'NOT_SUITABLE';
    flags.push({ ok: false, text: `Hb ${hb || 0} g/dL (< 12.5)` });
  } else {
    flags.push({ ok: true, text: `Hb ${hb} g/dL` });
  }

  const days = Number(donor.daysSinceLastDonation);
  if (Number.isNaN(days) || days < 90) {
    if (suggested !== 'NOT_SUITABLE') suggested = 'REVIEW_NEEDED';
    flags.push({ ok: false, text: `Last donation ${days || 0}d ago (< 90d)` });
  } else {
    flags.push({ ok: true, text: `Cooldown OK (${days}d)` });
  }

  if (donor.infectiousFlag) {
    suggested = 'NOT_SUITABLE';
    flags.push({ ok: false, text: 'Infectious Screening Flag' });
  } else {
    flags.push({ ok: true, text: 'Screening Clear' });
  }

  if (donor.recentFeverOrMeds) {
    if (suggested !== 'NOT_SUITABLE') suggested = 'REVIEW_NEEDED';
    flags.push({ ok: false, text: 'Recent Fever / Meds' });
  }

  if (patient.condition === 'Immunocompromised / Irradiated Need') {
    if (suggested !== 'NOT_SUITABLE') suggested = 'REVIEW_NEEDED';
    flags.push({ ok: false, text: 'Patient requires Irradiated unit' });
  }

  return { suggested, flags };
}

function LocationMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  return position === null ? null : (
    <Marker position={position}>
      <Popup>BloodBridge Dispatch Pin</Popup>
    </Marker>
  );
}

export default function BloodBridgeDashboard() {
  const defaultCenter = [30.5160, 76.6598];

  // Login & Dedicated Role ('donor' | 'needy' | 'doctor')
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginName, setLoginName] = useState('');
  const [loginId, setLoginId] = useState('');
  const [selectedRole, setSelectedRole] = useState('donor'); // 'donor' | 'needy' | 'doctor'
  const [loginError, setLoginError] = useState('');

  const [position, setPosition] = useState(defaultCenter);
  const [auditLogs, setAuditLogs] = useState([]);

  // ER Patient Medical History State
  const [patientInfo, setPatientInfo] = useState({
    patientName: 'ER Trauma Bay #2',
    bloodGroup: 'O_POS',
    condition: 'Trauma / Acute Bleeding',
    medicalHistory: 'Acute hemorrhage post road accident; no prior transfusion reaction'
  });

  // Donor Submission Form State
  const [donorSubmission, setDonorSubmission] = useState({
    name: 'Aarav Sharma',
    phoneNumber: '+919876543210',
    bloodGroup: 'O_POS',
    hemoglobin: 14.5,
    daysSinceLastDonation: 120,
    infectiousFlag: false,
    recentFeverOrMeds: false,
    reportFileName: 'CBC_Screening_Report.pdf',
    reportNotes: 'Hb 14.5 g/dL, HIV/HBsAg/HCV Non-Reactive, BP 120/80'
  });

  // Submissions queue: doctorStatus = 'PENDING_DOCTOR' | 'SUITABLE' | 'NOT_SUITABLE'
  const [submissions, setSubmissions] = useState([
    {
      id: 'sub-1',
      name: 'Aarav Sharma',
      phoneNumber: '+919876543210',
      bloodGroup: 'O_POS',
      hemoglobin: 14.5,
      daysSinceLastDonation: 120,
      infectiousFlag: false,
      recentFeverOrMeds: false,
      reportFileName: 'Aarav_CBC_Report.pdf',
      reportNotes: 'Hb 14.5 g/dL, Screening Non-Reactive',
      doctorStatus: 'PENDING_DOCTOR',
      doctorRemark: ''
    },
    {
      id: 'sub-2',
      name: 'Rohan Verma',
      phoneNumber: '+919123456789',
      bloodGroup: 'O_NEG',
      hemoglobin: 11.9,
      daysSinceLastDonation: 150,
      infectiousFlag: false,
      recentFeverOrMeds: false,
      reportFileName: 'Rohan_Lab_Report.pdf',
      reportNotes: 'Hb 11.9 g/dL, mild anemia note in lab slip',
      doctorStatus: 'PENDING_DOCTOR',
      doctorRemark: ''
    }
  ]);

  const [doctorRemarks, setDoctorRemarks] = useState({});

  const handleLogin = (e) => {
    e.preventDefault();
    if (!loginName.trim() || !loginId.trim()) {
      setLoginError('Please enter your name and ID/email.');
      return;
    }
    setLoginError('');
    setIsLoggedIn(true);
    setAuditLogs(prev => [
      `[${new Date().toLocaleTimeString()}] Login: ${loginName.trim()} entered as ${selectedRole.toUpperCase()}`,
      ...prev
    ]);
  };

  const quickFillRole = (role) => {
    setSelectedRole(role);
    setLoginError('');
    if (role === 'donor') {
      setLoginName('Aarav Sharma');
      setLoginId('donor@bloodbridge.org');
    } else if (role === 'needy') {
      setLoginName('ER Desk — City Hospital');
      setLoginId('er@bloodbridge.org');
    } else {
      setLoginName('Dr. Meera Nair');
      setLoginId('doctor@bloodbridge.org');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  const handleSubmitDonorReport = (e) => {
    e.preventDefault();
    const newEntry = {
      id: `sub-${Date.now()}`,
      ...donorSubmission,
      doctorStatus: 'PENDING_DOCTOR',
      doctorRemark: 'Awaiting doctor review of uploaded medical report & ER history'
    };
    setSubmissions(prev => [newEntry, ...prev]);
    setAuditLogs(prev => [
      `[${new Date().toLocaleTimeString()}] Donor ${newEntry.name} submitted medical report (${newEntry.reportFileName}) → Sent to Doctor for suitability decision.`,
      ...prev
    ]);
  };

  const handleDoctorDecision = (id, decision) => {
    const customNote = (doctorRemarks[id] || '').trim();
    const defaultNote =
      decision === 'SUITABLE'
        ? 'Approved by Doctor after checking medical report & patient history.'
        : 'Marked Not Suitable by Doctor after clinical/report review.';

    setSubmissions(prev =>
      prev.map(item => {
        if (item.id !== id) return item;
        setAuditLogs(logs => [
          `[${new Date().toLocaleTimeString()}] Doctor ${loginName || 'Panel'} marked ${item.name} as ${decision}.`,
          ...logs
        ]);
        return {
          ...item,
          doctorStatus: decision,
          doctorRemark: customNote || defaultNote
        };
      })
    );
  };

  // LOGIN SCREEN WITH EXPLICIT ROLE SELECTION (DONOR / NEEDY / DOCTOR)
  if (!isLoggedIn) {
    return (
      <div className="bb-bright-shell">
        <div className="bb-login-wrapper">
          <div className="bb-login-card" style={{ maxWidth: '470px' }}>
            <div style={{ textAlign: 'center', marginBottom: '18px' }}>
              <span style={{
                display: 'inline-block',
                background: 'linear-gradient(135deg, #ffe4e6, #e0f2fe)',
                color: '#0f172a',
                fontWeight: 800,
                fontSize: '11px',
                padding: '5px 12px',
                borderRadius: '999px',
                marginBottom: '8px'
              }}>
                🩺 DONOR · DOCTOR · NEEDY WORKFLOW
              </span>
              <h1 className="bb-hero-title" style={{ fontSize: '24px' }}>BloodBridge Login</h1>
              <p style={{ margin: '6px 0 0 0', fontSize: '13px', color: '#475569' }}>
                Select who is logging in to open their dedicated workspace
              </p>
            </div>

            <form onSubmit={handleLogin}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
                Who is logging in?
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '14px' }}>
                {[
                  { key: 'donor', label: '🩸 Donor' },
                  { key: 'needy', label: '🚨 Needy (ER)' },
                  { key: 'doctor', label: '🩺 Doctor' }
                ].map(r => (
                  <button
                    key={r.key}
                    type="button"
                    onClick={() => setSelectedRole(r.key)}
                    className="bb-action-btn"
                    style={{
                      padding: '10px 8px',
                      fontSize: '12px',
                      background: selectedRole === r.key
                        ? 'linear-gradient(135deg, #ff2a5f, #ff7a00)'
                        : '#f1f5f9',
                      color: selectedRole === r.key ? '#ffffff' : '#334155',
                      border: selectedRole === r.key ? 'none' : '1px solid #cbd5e1'
                    }}
                  >
                    {r.label}
                  </button>
                ))}
              </div>

              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>Full Name</label>
              <input
                type="text"
                placeholder="Enter your name"
                value={loginName}
                onChange={(e) => setLoginName(e.target.value)}
                className="bb-login-input"
                style={{ marginBottom: '12px' }}
              />

              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>Email or ID</label>
              <input
                type="text"
                placeholder="name@hospital.org"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                className="bb-login-input"
                style={{ marginBottom: '14px' }}
              />

              {loginError && (
                <div style={{ backgroundColor: '#ffe4e6', color: '#be123c', padding: '8px 12px', borderRadius: '10px', fontSize: '12px', fontWeight: 700, marginBottom: '12px' }}>
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                className="bb-action-btn"
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '14px',
                  background: 'linear-gradient(135deg, #ff2a5f, #ff7a00)',
                  color: '#ffffff',
                  marginBottom: '10px'
                }}
              >
                Login as {selectedRole === 'donor' ? 'Donor' : selectedRole === 'needy' ? 'Needy (ER)' : 'Doctor'} →
              </button>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
                <button type="button" onClick={() => quickFillRole('donor')} className="bb-action-btn" style={{ padding: '7px', fontSize: '11px', background: '#e0f2fe', color: '#0369a1' }}>
                  Demo Donor
                </button>
                <button type="button" onClick={() => quickFillRole('needy')} className="bb-action-btn" style={{ padding: '7px', fontSize: '11px', background: '#ffe4e6', color: '#be123c' }}>
                  Demo Needy
                </button>
                <button type="button" onClick={() => quickFillRole('doctor')} className="bb-action-btn" style={{ padding: '7px', fontSize: '11px', background: '#ede9fe', color: '#6d28d9' }}>
                  Demo Doctor
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  const suitableDonorsForNeedy = submissions.filter(s => s.doctorStatus === 'SUITABLE');

  return (
    <div className="bb-bright-shell">
      <div className="bb-bright-container">
        <header className="bb-top-banner">
          <div>
            <h1 className="bb-hero-title">
              {selectedRole === 'donor' && '🩸 Donor Portal — Medical Report Submission'}
              {selectedRole === 'needy' && '🚨 Needy (ER) Portal — Doctor-Cleared Matches'}
              {selectedRole === 'doctor' && '🩺 Doctor Review Desk — Suitability Decision'}
            </h1>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#475569', fontWeight: 500 }}>
              Dedicated role workspace (use Logout to switch between Donor, Needy, and Doctor)
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span className="bb-welcome-pill">
              {loginName} · Role: {selectedRole.toUpperCase()}
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="bb-action-btn"
              style={{ background: '#0f172a', color: '#ffffff', padding: '8px 14px', fontSize: '12px' }}
            >
              Logout
            </button>
          </div>
        </header>

        {/* DEDICATED DONOR DASHBOARD */}
        {selectedRole === 'donor' && (
          <div key="donor-workspace" className="bb-tab-panel bb-dispatch-grid" style={{ marginTop: '20px' }}>
            <div className="bb-bright-card">
              <form onSubmit={handleSubmitDonorReport}>
                <h2 style={{ margin: '0 0 14px 0', fontSize: '18px', fontWeight: 800, color: '#0369a1' }}>
                  Submit Donation & Medical Report
                </h2>

                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '5px' }}>Donor Name</label>
                <input
                  type="text"
                  value={donorSubmission.name}
                  onChange={(e) => setDonorSubmission({ ...donorSubmission, name: e.target.value })}
                  className="bb-login-input"
                  style={{ marginBottom: '12px' }}
                />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '5px' }}>Blood Group</label>
                    <select
                      value={donorSubmission.bloodGroup}
                      onChange={(e) => setDonorSubmission({ ...donorSubmission, bloodGroup: e.target.value })}
                      className="bb-login-input"
                    >
                      {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg.replace('_', ' ')}</option>)}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '5px' }}>Hemoglobin (g/dL)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={donorSubmission.hemoglobin}
                      onChange={(e) => setDonorSubmission({ ...donorSubmission, hemoglobin: e.target.value })}
                      className="bb-login-input"
                    />
                  </div>
                </div>

                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '5px' }}>
                  Days Since Last Donation
                </label>
                <input
                  type="number"
                  value={donorSubmission.daysSinceLastDonation}
                  onChange={(e) => setDonorSubmission({ ...donorSubmission, daysSinceLastDonation: e.target.value })}
                  className="bb-login-input"
                  style={{ marginBottom: '12px' }}
                />

                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '5px' }}>
                  Attach Medical Report File
                </label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setDonorSubmission(prev => ({ ...prev, reportFileName: file.name }));
                    }
                  }}
                  className="bb-login-input"
                  style={{ marginBottom: '12px', padding: '9px' }}
                />

                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '5px' }}>
                  Medical Report Lab Findings
                </label>
                <textarea
                  rows={2}
                  value={donorSubmission.reportNotes}
                  onChange={(e) => setDonorSubmission({ ...donorSubmission, reportNotes: e.target.value })}
                  className="bb-login-input"
                  style={{ marginBottom: '12px' }}
                />

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px', fontSize: '13px', fontWeight: 600 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={donorSubmission.infectiousFlag}
                      onChange={(e) => setDonorSubmission({ ...donorSubmission, infectiousFlag: e.target.checked })}
                    />
                    Infectious Screening Flag Present
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={donorSubmission.recentFeverOrMeds}
                      onChange={(e) => setDonorSubmission({ ...donorSubmission, recentFeverOrMeds: e.target.checked })}
                    />
                    Recent Fever / Medication in Last 14 Days
                  </label>
                </div>

                <button
                  type="submit"
                  className="bb-action-btn"
                  style={{
                    width: '100%',
                    padding: '12px',
                    fontSize: '13px',
                    background: 'linear-gradient(135deg, #0ea5e9, #2563eb)',
                    color: '#ffffff'
                  }}
                >
                  Submit Report for Doctor Approval
                </button>
              </form>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div className="bb-bright-card">
                <h3 style={{ margin: '0 0 12px 0', fontSize: '17px', fontWeight: 800 }}>
                  My Submitted Reports & Doctor Status
                </h3>
                {submissions.map(sub => (
                  <div key={sub.id} className="bb-donor-card" style={{ display: 'block' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <div>
                        <b>{sub.name}</b> ({sub.bloodGroup.replace('_', ' ')}) · Hb: <b>{sub.hemoglobin} g/dL</b> · Report: <b>{sub.reportFileName}</b>
                        <div style={{ fontSize: '12px', color: '#475569', marginTop: '4px' }}>
                          Doctor Note: {sub.doctorRemark}
                        </div>
                      </div>
                      <span
                        style={{
                          padding: '5px 11px',
                          borderRadius: '999px',
                          fontSize: '11px',
                          fontWeight: 800,
                          backgroundColor:
                            sub.doctorStatus === 'SUITABLE' ? '#dcfce7' :
                            sub.doctorStatus === 'NOT_SUITABLE' ? '#ffe4e6' : '#fef3c7',
                          color:
                            sub.doctorStatus === 'SUITABLE' ? '#15803d' :
                            sub.doctorStatus === 'NOT_SUITABLE' ? '#be123c' : '#92400e'
                        }}
                      >
                        {sub.doctorStatus === 'SUITABLE' && '✓ SUITABLE (DOCTOR APPROVED)'}
                        {sub.doctorStatus === 'NOT_SUITABLE' && '✕ NOT SUITABLE'}
                        {sub.doctorStatus === 'PENDING_DOCTOR' && '⏳ PENDING DOCTOR REVIEW'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bb-bright-card" style={{ padding: 0, overflow: 'hidden', height: '240px' }}>
                <MapContainer center={defaultCenter} zoom={14} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <LocationMarker position={position} setPosition={setPosition} />
                </MapContainer>
              </div>
            </div>
          </div>
        )}

        {/* DEDICATED DOCTOR GATEKEEPER DASHBOARD */}
        {selectedRole === 'doctor' && (
          <div key="doctor-workspace" className="bb-tab-panel" style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div className="bb-bright-card">
              <h2 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 800, color: '#6d28d9' }}>
                🩺 Doctor Suitability Review Queue
              </h2>
              <p style={{ margin: '0 0 14px 0', fontSize: '13px', color: '#475569' }}>
                Active ER Case: <b>{patientInfo.patientName}</b> ({patientInfo.bloodGroup.replace('_', ' ')}) — History: <b>{patientInfo.medicalHistory}</b>
              </p>

              {submissions.map(sub => {
                const signal = inspectMedicalSignals(sub, patientInfo);
                return (
                  <div key={sub.id} className="bb-donor-card" style={{ display: 'block', borderLeftColor: '#7c3aed' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                      <div>
                        <span style={{ fontSize: '16px', fontWeight: 800 }}>{sub.name}</span>
                        <span style={{ marginLeft: '8px', fontSize: '12px', fontWeight: 700, color: '#6d28d9' }}>
                          {sub.bloodGroup.replace('_', ' ')} · Report: {sub.reportFileName}
                        </span>
                        <div style={{ fontSize: '12px', color: '#334155', marginTop: '4px' }}>
                          Lab Notes: <b>{sub.reportNotes}</b>
                        </div>
                      </div>

                      <span
                        style={{
                          padding: '5px 11px',
                          borderRadius: '999px',
                          fontSize: '11px',
                          fontWeight: 800,
                          backgroundColor:
                            sub.doctorStatus === 'SUITABLE' ? '#dcfce7' :
                            sub.doctorStatus === 'NOT_SUITABLE' ? '#ffe4e6' : '#ede9fe',
                          color:
                            sub.doctorStatus === 'SUITABLE' ? '#15803d' :
                            sub.doctorStatus === 'NOT_SUITABLE' ? '#be123c' : '#5b21b6'
                        }}
                      >
                        Decision: {sub.doctorStatus} (System Hint: {signal.suggested})
                      </span>
                    </div>

                    <div style={{ marginTop: '8px' }}>
                      {signal.flags.map((f, idx) => (
                        <span
                          key={idx}
                          className="bb-check-chip"
                          style={{
                            backgroundColor: f.ok ? '#f0fdf4' : '#fef2f2',
                            color: f.ok ? '#166534' : '#991b1b'
                          }}
                        >
                          {f.ok ? '✓' : '✕'} {f.text}
                        </span>
                      ))}
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginTop: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                      <input
                        type="text"
                        placeholder="Doctor clinical remark (optional)..."
                        value={doctorRemarks[sub.id] || ''}
                        onChange={(e) => setDoctorRemarks(prev => ({ ...prev, [sub.id]: e.target.value }))}
                        className="bb-login-input"
                        style={{ flex: 1, minWidth: '220px', padding: '8px 12px', fontSize: '12px' }}
                      />
                      <button
                        type="button"
                        onClick={() => handleDoctorDecision(sub.id, 'SUITABLE')}
                        className="bb-action-btn"
                        style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)', color: '#ffffff', padding: '9px 14px', fontSize: '12px' }}
                      >
                        ✓ Mark Suitable
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDoctorDecision(sub.id, 'NOT_SUITABLE')}
                        className="bb-action-btn"
                        style={{ background: 'linear-gradient(135deg, #e11d48, #be123c)', color: '#ffffff', padding: '9px 14px', fontSize: '12px' }}
                      >
                        ✕ Not Suitable
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* DEDICATED NEEDY (ER) DASHBOARD */}
        {selectedRole === 'needy' && (
          <div key="needy-workspace" className="bb-tab-panel bb-dispatch-grid" style={{ marginTop: '20px' }}>
            <div className="bb-bright-card">
              <h2 style={{ margin: '0 0 14px 0', fontSize: '18px', fontWeight: 800, color: '#be123c' }}>
                ER Patient Medical History
              </h2>

              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '5px' }}>Patient / Bay</label>
              <input
                type="text"
                value={patientInfo.patientName}
                onChange={(e) => setPatientInfo({ ...patientInfo, patientName: e.target.value })}
                className="bb-login-input"
                style={{ marginBottom: '12px' }}
              />

              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '5px' }}>Required Blood Group</label>
              <select
                value={patientInfo.bloodGroup}
                onChange={(e) => setPatientInfo({ ...patientInfo, bloodGroup: e.target.value })}
                className="bb-login-input"
                style={{ marginBottom: '12px' }}
              >
                {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg.replace('_', ' ')}</option>)}
              </select>

              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '5px' }}>Condition</label>
              <select
                value={patientInfo.condition}
                onChange={(e) => setPatientInfo({ ...patientInfo, condition: e.target.value })}
                className="bb-login-input"
                style={{ marginBottom: '12px' }}
              >
                <option value="Trauma / Acute Bleeding">Trauma / Acute Bleeding</option>
                <option value="Severe Anemia">Severe Anemia</option>
                <option value="Immunocompromised / Irradiated Need">Immunocompromised / Irradiated Need</option>
                <option value="Surgery / Post-Op">Surgery / Post-Op</option>
              </select>

              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '5px' }}>Medical History Notes</label>
              <textarea
                rows={3}
                value={patientInfo.medicalHistory}
                onChange={(e) => setPatientInfo({ ...patientInfo, medicalHistory: e.target.value })}
                className="bb-login-input"
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div className="bb-bright-card">
                <h3 style={{ margin: '0 0 12px 0', fontSize: '17px', fontWeight: 800 }}>
                  Doctor-Approved Suitable Donors ({suitableDonorsForNeedy.length})
                </h3>

                {suitableDonorsForNeedy.length === 0 ? (
                  <p style={{ margin: 0, fontSize: '13px', color: '#475569' }}>
                    Abhi kisi donor ko Doctor ne <b>SUITABLE</b> approve nahi kiya hai. Login as <b>Doctor</b> to review submitted reports first.
                  </p>
                ) : (
                  suitableDonorsForNeedy.map(d => {
                    const signal = inspectMedicalSignals(d, patientInfo);
                    return (
                      <div key={d.id} className="bb-donor-card" style={{ display: 'block', borderLeftColor: '#16a34a' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <div>
                            <b style={{ fontSize: '15px' }}>{d.name}</b> ({d.bloodGroup.replace('_', ' ')}) · Hb: <b>{d.hemoglobin} g/dL</b>
                            <div style={{ fontSize: '12px', color: '#15803d', fontWeight: 600, marginTop: '3px' }}>
                              Doctor Clearance: {d.doctorRemark}
                            </div>
                          </div>

                          <div style={{ display: 'flex', gap: '8px' }}>
                            <a
                              href={`https://wa.me/${d.phoneNumber}?text=Urgent%20ER%20Blood%20Need%20(${patientInfo.bloodGroup})%20at%20${encodeURIComponent(patientInfo.patientName)}`}
                              target="_blank"
                              rel="noreferrer"
                              className="bb-action-btn"
                              style={{ background: '#16a34a', color: '#ffffff', padding: '7px 12px', textDecoration: 'none', fontSize: '12px' }}
                            >
                              WhatsApp
                            </a>
                            <a
                              href={`tel:${d.phoneNumber}`}
                              className="bb-action-btn"
                              style={{ background: '#2563eb', color: '#ffffff', padding: '7px 12px', textDecoration: 'none', fontSize: '12px' }}
                            >
                              Call
                            </a>
                          </div>
                        </div>

                        <div style={{ marginTop: '8px' }}>
                          {signal.flags.map((f, idx) => (
                            <span
                              key={idx}
                              className="bb-check-chip"
                              style={{
                                backgroundColor: f.ok ? '#f0fdf4' : '#fef2f2',
                                color: f.ok ? '#166534' : '#991b1b'
                              }}
                            >
                              {f.ok ? '✓' : '✕'} {f.text}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="bb-bright-card" style={{ padding: 0, overflow: 'hidden', height: '240px' }}>
                <MapContainer center={defaultCenter} zoom={14} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <LocationMarker position={position} setPosition={setPosition} />
                </MapContainer>
              </div>
            </div>
          </div>
        )}

        {/* Audit Trail */}
        <div className="bb-bright-card" style={{ marginTop: '20px' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '15px', fontWeight: 800 }}>📡 Workflow Audit Log</h3>
          <div className="bb-terminal-bright" style={{ minHeight: '105px' }}>
            {auditLogs.length === 0 ? (
              <span style={{ color: '#94a3b8' }}>[Ready] Donor submits report → Doctor approves/rejects → Needy sees approved suitable donors.</span>
            ) : (
              auditLogs.map((log, i) => <div key={i} style={{ marginBottom: '5px' }}>{log}</div>)
            )}
          </div>
        </div>
      </div>
    </div>
  );
}