import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Header.css';

function Header() {
  const location = useLocation();
  const isInternal = location.pathname !== '/';
  const [mobileOpen, setMobileOpen] = useState(false);
  
  const isAdminLoggedIn = localStorage.getItem('adminId');
  const isDonorLoggedIn = localStorage.getItem('donorId');

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const navItems = isAdminLoggedIn
    ? [
        { to: '/admin/dashboard', label: 'Dashboard' },
        { to: '/admin/appointments', label: 'Bookings' },
        { to: '/admin/blood-units', label: 'Inventory' },
      ]
    : [
        { to: '/', label: 'Home' },
        { to: '/book-appointment', label: 'Appointments' },
        { to: '/hospitals', label: 'Hospitals' },
        { to: '/blood-camps', label: 'Camps' },
      ];

  const handleLogout = () => {
    localStorage.removeItem('adminId');
    localStorage.removeItem('adminEmail');
    localStorage.removeItem('adminName');
    localStorage.removeItem('donorId');
    localStorage.removeItem('donorEmail');
    localStorage.removeItem('donorName');
    window.location.href = '/';
  };

  return (
    <header className={`header-premium ${isInternal ? 'is-internal' : ''}`}>
      <div className="container header-container">
        <Link to="/" className="brand-link" onClick={() => setMobileOpen(false)}>
          <img src="/favicon.svg" alt="VitalFlow Logo" className="brand-logo" />
          <span className="brand-text">Vital<span>Flow</span></span>
        </Link>
        
        <nav className={`header-nav ${mobileOpen ? 'open' : ''}`}>
          <div className="header-links">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`nav-link ${isActive(item.to) ? 'active' : ''}`}
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="header-actions">
            {!isAdminLoggedIn && (
              <Link to="/emergency-requests" className="btn-nav-urgent" onClick={() => setMobileOpen(false)}>
                Emergency
              </Link>
            )}

            {isInternal && (isAdminLoggedIn || isDonorLoggedIn) ? (
              <button className="btn-logout-new" onClick={handleLogout}>Logout</button>
            ) : null}
          </div>
        </nav>
        
        <button
          className={`mobile-toggle ${mobileOpen ? 'active' : ''}`}
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle navigation"
          type="button"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </header>
  );
}

export default Header;
