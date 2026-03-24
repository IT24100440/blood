import React, { useState, useEffect, useRef } from 'react';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import { Link } from 'react-router-dom';
import { getAllBloodCamps, getAllBloodUnits, getAllEmergencyRequests } from '../../services/api';
import './Home.css';

/* ── Animated counter ── */
function useCounter(target, duration = 2000, active = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!active) return;
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      setCount(Math.floor((1 - Math.pow(1 - p, 3)) * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, active]);
  return count;
}

function Home() {
  const [bloodCamps, setBloodCamps] = useState([]);
  const [bloodUnits, setBloodUnits] = useState([]);
  const [emergencyRequests, setEmergencyRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statsOn, setStatsOn] = useState(false);
  const [activeTab, setActiveTab] = useState('camps');
  const statsRef = useRef(null);

  const camps = useCounter(150, 2000, statsOn);
  const donors = useCounter(5200, 2000, statsOn);
  const lives = useCounter(12800, 2000, statsOn);
  const hosps = useCounter(48, 2000, statsOn);

  useEffect(() => {
    fetchData();
    const t = setInterval(fetchData, 60000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setStatsOn(true); },
      { threshold: 0.3 }
    );
    if (statsRef.current) obs.observe(statsRef.current);
    return () => obs.disconnect();
  }, []);

  const fetchData = async () => {
    try {
      const [campRes, unitsRes, emergRes] = await Promise.all([
        getAllBloodCamps(), getAllBloodUnits(), getAllEmergencyRequests()
      ]);
      const campsData = Array.isArray(campRes.data) ? campRes.data : [];
      const unitsData = Array.isArray(unitsRes.data) ? unitsRes.data : [];
      const emergData = Array.isArray(emergRes.data) ? emergRes.data : [];

      setBloodCamps(
        campsData.filter(c => new Date(c.date) > new Date()).slice(0, 3)
      );
      setBloodUnits(unitsData.slice(0, 6));
      setEmergencyRequests(
        emergData.filter(r => !r.expiresAt || new Date(r.expiresAt) > new Date()).slice(0, 4)
      );
      setLoading(false);
    } catch (err) {
      console.error(err);
      setBloodCamps([]); setBloodUnits([]); setEmergencyRequests([]);
      setLoading(false);
    }
  };

  const getTimeLeft = (exp) => {
    if (!exp) return null;
    const ms = new Date(exp) - new Date();
    if (ms <= 0) return 'Expired';
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    return h > 0 ? `${h}h ${m}m left` : `${m}m left`;
  };

  const urgencyMap = {
    high: { label: 'CRITICAL', color: '#c0392b', bg: '#fdecea' },
    medium: { label: 'MODERATE', color: '#e67e22', bg: '#fef3e2' },
    low: { label: 'STABLE', color: '#27ae60', bg: '#eafaf1' },
  };

  const bloodColors = {
    'A+': '#c0392b', 'A-': '#922b21', 'B+': '#d35400', 'B-': '#a04000',
    'AB+': '#8e44ad', 'AB-': '#6c3483', 'O+': '#1a5276', 'O-': '#154360',
  };

  return (
    <div className="home-page">
      <Header />

      {/* ═══════════ HERO ═══════════ */}
      <section className="hp-hero">
        <div className="hp-hero-img-wrap">
          <img
            src="https://images.pexels.com/photos/7089401/pexels-photo-7089401.jpeg?auto=compress&cs=tinysrgb&w=2200"
            alt="Blood donation"
            className="hp-hero-img"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = 'https://images.pexels.com/photos/6823567/pexels-photo-6823567.jpeg?auto=compress&cs=tinysrgb&w=2200';
            }}
          />
          <div className="hp-hero-overlay" />
        </div>
        <div className="hp-hero-content">
          <span className="hp-hero-tag">🩸 Smart Blood Donation Network</span>
          <h1 className="hp-hero-title">
            Donate Blood,<br />
            <span className="hp-red">Save Lives</span>
          </h1>
          <p className="hp-hero-desc">
            Connect with blood banks and hospitals instantly. Book your appointment,
            respond to emergencies, and be someone's hero today.
          </p>
          <div className="hp-hero-btns">
            <Link to="/book-appointment" className="btn-red">
              💉 Book Appointment
            </Link>
            <Link to="/emergency-requests" className="btn-outline-red">
              🚨 Emergency Requests
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════ STATS ═══════════ */}
      <section className="hp-stats" ref={statsRef}>
        <div className="hp-container hp-stats-grid">
          {[
            { n: camps, s: '+', icon: '🏕️', label: 'Blood Camps' },
            { n: donors, s: '+', icon: '🫀', label: 'Active Donors' },
            { n: lives, s: '+', icon: '❤️‍🔥', label: 'Lives Saved' },
            { n: hosps, s: '', icon: '🏥', label: 'Partner Hospitals' },
          ].map((st, i) => (
            <div className="hp-stat-card" key={i}>
              <span className="hp-stat-icon">{st.icon}</span>
              <span className="hp-stat-num">{st.n.toLocaleString()}{st.s}</span>
              <span className="hp-stat-label">{st.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════ WHY DONATE — image split ═══════════ */}
      <section className="hp-why">
        <div className="hp-container hp-why-inner">
          <div className="hp-why-img-col">
            <img
              src="https://images.pexels.com/photos/8460157/pexels-photo-8460157.jpeg?auto=compress&cs=tinysrgb&w=2000"
              alt="Doctor with blood donation bag"
              className="hp-why-img"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = 'https://images.pexels.com/photos/7108290/pexels-photo-7108290.jpeg?auto=compress&cs=tinysrgb&w=2000';
              }}
            />
          </div>
          <div className="hp-why-text-col">
            <span className="hp-section-tag">Why Donate?</span>
            <h2 className="hp-section-title">One Donation,<br />Three Lives Saved</h2>
            <p className="hp-section-desc">
              Blood cannot be manufactured. Every 2 seconds someone in the world needs
              blood. Your single donation can be separated into red cells, platelets,
              and plasma — each saving a different life.
            </p>
            <ul className="hp-why-list">
              <li><span className="hp-check">✔</span> Helps accident victims survive</li>
              <li><span className="hp-check">✔</span> Supports cancer & surgery patients</li>
              <li><span className="hp-check">✔</span> Safe, quick &amp; virtually painless</li>
              <li><span className="hp-check">✔</span> Your body replenishes blood within days</li>
            </ul>
            <Link to="/book-appointment" className="btn-red" style={{ marginTop: '1.5rem', display: 'inline-flex' }}>
              Start Donating →
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════ LIVE DATA TABS ═══════════ */}
      <section className="hp-live">
        <div className="hp-container">
          <div className="hp-section-head">
            <span className="hp-section-tag">
              <span className="hp-blink" />  Live Updates
            </span>
            <h2 className="hp-section-title">Real-Time Blood Network</h2>
            <p className="hp-section-sub">Refreshed every minute — always up to date</p>
          </div>

          <div className="hp-tabs">
            {[
              { key: 'camps', label: '🏕️ Blood Camps', count: bloodCamps.length },
              { key: 'emergency', label: '🚨 Emergency', count: emergencyRequests.length },
              { key: 'units', label: '🩸 Blood Units', count: bloodUnits.length },
            ].map(t => (
              <button
                key={t.key}
                className={`hp-tab${activeTab === t.key ? ' active' : ''}`}
                onClick={() => setActiveTab(t.key)}
              >
                {t.label}
                {t.count > 0 && <span className="hp-tab-badge">{t.count}</span>}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="hp-loading">
              <div className="hp-spinner" />
              <p>Loading live data…</p>
            </div>
          ) : (
            <div className="hp-tab-panel">

              {/* ── Camps ── */}
              {activeTab === 'camps' && (
                <>
                  {bloodCamps.length === 0
                    ? <div className="hp-empty">🏕️ No upcoming blood camps at the moment.</div>
                    : (
                      <div className="hp-camps-list">
                        {bloodCamps.map(camp => (
                          <div className="hp-camp-card" key={camp.campId}>
                            <div className="hp-camp-left">
                              <div className="hp-camp-date">
                                <span className="hp-camp-day">{new Date(camp.date).getDate()}</span>
                                <span className="hp-camp-mon">{new Date(camp.date).toLocaleString('default', { month: 'short' })}</span>
                              </div>
                            </div>
                            <div className="hp-camp-body">
                              <h3>{camp.title}</h3>
                              <div className="hp-camp-meta">
                                <span>⏰ {camp.time}</span>
                                <span>📍 {camp.location}</span>
                                <span>🏥 {camp.hospital?.hospitalName}</span>
                                <span>🏙️ {camp.hospital?.city}</span>
                                <span>👥 Max {camp.maxDonors} donors</span>
                              </div>
                              {camp.description && <p className="hp-camp-desc">{camp.description}</p>}
                            </div>
                            <div className="hp-camp-action">
                              <button
                                className="btn-red btn-sm"
                                onClick={() => window.location.href = '/book-appointment'}
                              >
                                Register →
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  }
                  <div className="hp-view-all">
                    <Link to="/blood-camps" className="hp-view-link">View All Blood Camps →</Link>
                  </div>
                </>
              )}

              {/* ── Emergency ── */}
              {activeTab === 'emergency' && (
                <>
                  {emergencyRequests.length === 0
                    ? <div className="hp-empty">✅ No active emergency requests right now.</div>
                    : (
                      <div className="hp-emer-grid">
                        {emergencyRequests.map(req => {
                          const u = urgencyMap[req.urgencyLevel?.toLowerCase()] || urgencyMap.medium;
                          const tl = getTimeLeft(req.expiresAt);
                          return (
                            <div
                              className="hp-emer-card"
                              key={req.requestId}
                              style={{ borderTopColor: u.color }}
                            >
                              <div className="hp-emer-top">
                                <span
                                  className="hp-blood-pill"
                                  style={{ background: bloodColors[req.bloodTypeNeeded] || '#c0392b' }}
                                >
                                  {req.bloodTypeNeeded}
                                </span>
                                <span className="hp-urgency-tag" style={{ color: u.color, background: u.bg }}>
                                  {u.label}
                                </span>
                                {tl && <span className="hp-time-tag">⏱ {tl}</span>}
                              </div>
                              <h3 className="hp-emer-title">{req.title}</h3>
                              <div className="hp-emer-info">
                                <span>📦 {req.requiredUnits} units</span>
                                <span>🏥 {req.hospital?.hospitalName || 'N/A'}</span>
                                <span>📍 {req.city}</span>
                                <span>📞 {req.contactNumber}</span>
                              </div>
                              {req.message && <p className="hp-emer-msg">"{req.message}"</p>}
                              <button 
                                className="btn-red btn-sm" 
                                style={{ marginTop: '1rem', background: u.color }}
                                onClick={() => window.location.href = '/emergency-requests'}
                              >
                                Respond Now →
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )
                  }
                  <div className="hp-view-all">
                    <Link to="/emergency-requests" className="hp-view-link red">View All Emergencies →</Link>
                  </div>
                </>
              )}

              {/* ── Blood Units ── */}
              {activeTab === 'units' && (
                <>
                  {bloodUnits.length === 0
                    ? <div className="hp-empty">🩸 No blood unit data available.</div>
                    : (
                      <div className="hp-units-grid">
                        {bloodUnits.map(unit => (
                          <div className="hp-unit-card" key={unit.unitId}>
                            <div
                              className="hp-unit-badge"
                              style={{ background: bloodColors[unit.bloodType] || '#c0392b' }}
                            >
                              {unit.bloodType}
                            </div>
                            <div className="hp-unit-info">
                              <h4>{unit.hospital?.hospitalName}</h4>
                              <p>📍 {unit.hospital?.city}</p>
                              <div className="hp-unit-count">
                                <strong>{unit.unitsAvailable}</strong>
                                <span> units</span>
                              </div>
                              <div className="hp-progress-bg">
                                <div
                                  className="hp-progress-bar"
                                  style={{
                                    width: `${Math.min((unit.unitsAvailable / 50) * 100, 100)}%`,
                                    background: bloodColors[unit.bloodType] || '#c0392b',
                                  }}
                                />
                              </div>
                              <small>Updated {new Date(unit.updatedAt).toLocaleDateString()}</small>
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  }
                  <div className="hp-view-all">
                    <Link to="/blood-units" className="hp-view-link">View All Blood Units →</Link>
                  </div>
                </>
              )}

            </div>
          )}
        </div>
      </section>

      {/* ═══════════ BLOOD CAMP IMAGE BANNER ═══════════ */}
      <section className="hp-camp-banner">
        <img
          src="https://images.pexels.com/photos/7659564/pexels-photo-7659564.jpeg?auto=compress&cs=tinysrgb&w=2200"
          alt="Blood donation camp"
          className="hp-camp-banner-img"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = 'https://images.pexels.com/photos/6646918/pexels-photo-6646918.jpeg?auto=compress&cs=tinysrgb&w=2200';
          }}
        />
        <div className="hp-camp-banner-overlay">
          <div className="hp-camp-banner-content">
            <h2>Join Our Next Blood Camp</h2>
            <p>Volunteer, donate, or sponsor a blood camp in your city.</p>
            <Link to="/blood-camps" className="btn-white">Find a Camp Near Me →</Link>
          </div>
        </div>
      </section>

      {/* ═══════════ HOW IT WORKS ═══════════ */}
      <section className="hp-steps">
        <div className="hp-container">
          <div className="hp-section-head">
            <span className="hp-section-tag">Process</span>
            <h2 className="hp-section-title">How It Works</h2>
            <p className="hp-section-sub">Simple steps to save a life</p>
          </div>
          <div className="hp-steps-grid">
            {[
              { num: '01', icon: '📋', title: 'Register & Book', desc: 'Book a donation appointment at a nearby hospital or blood camp in just a few clicks.' },
              { num: '02', icon: '🏥', title: 'Visit & Donate', desc: 'Head to your appointment. The donation process takes only 10–15 minutes.' },
              { num: '03', icon: '🩸', title: 'Blood Processed', desc: 'Your donation is tested, processed, and stored safely for patients in need.' },
              { num: '04', icon: '❤️', title: 'Lives Saved', desc: 'Your blood reaches patients — each donation can save up to 3 lives.' },
            ].map((s, i) => (
              <div className="hp-step" key={i}>
                <div className="hp-step-num">{s.num}</div>
                <div className="hp-step-icon">{s.icon}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ EMERGENCY BANNER ═══════════ */}
      <section className="hp-emergency-banner">
        <div className="hp-emergency-banner-img-wrap">
          <img
            src="https://images.pexels.com/photos/8940787/pexels-photo-8940787.jpeg?auto=compress&cs=tinysrgb&w=2200"
            alt="Emergency response"
            className="hp-emergency-banner-img"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = 'https://images.pexels.com/photos/1170979/pexels-photo-1170979.jpeg?auto=compress&cs=tinysrgb&w=2200';
            }}
          />
          <div className="hp-emergency-overlay" />
        </div>
        <div className="hp-emergency-content">
          <span className="hp-emer-badge">🚨 Emergency</span>
          <h2>Blood Needed Urgently?</h2>
          <p>Post an emergency blood request instantly. Our network of donors gets notified right away.</p>
          <Link to="/emergency-requests" className="btn-white">Post Emergency Request →</Link>
        </div>
      </section>

      {/* ═══════════ CTA ═══════════ */}
      <section className="hp-cta">
        <div className="hp-container hp-cta-inner">
          <div className="hp-cta-text">
            <h2>Ready to Make a Difference?</h2>
            <p>Every drop counts. Join thousands of donors saving lives every day.</p>
          </div>
          <div className="hp-cta-btns">
            <Link to="/book-appointment" className="btn-red btn-lg">💉 Book Appointment</Link>
            <Link to="/hospitals" className="btn-outline-red btn-lg">🏥 Find Hospitals</Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Home;
