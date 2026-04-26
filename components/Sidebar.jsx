
function Sidebar({ currentView, onNavigate, currentUser, onLogout, collapsed, onToggle, dbConnected }) {
  const [hovItem, setHovItem] = React.useState(null);

  const navItems = [
    { id: 'meeting',   label: 'Meeting',   icon: NavMeetingIcon },
    { id: 'board',     label: 'Board',     icon: NavBoardIcon },
    { id: 'my-board',  label: 'My Board',  icon: NavMyBoardIcon },
    { id: 'dashboard', label: 'Dashboard', icon: NavDashIcon },
    { id: 'search',    label: 'Search',    icon: NavSearchIcon },
    { id: 'setup',     label: 'Import',    icon: NavSetupIcon },
  ];

  const W = collapsed ? 60 : 192;

  return (
    <div style={{
      width: W, minHeight: '100vh', background: '#0F1923',
      display: 'flex', flexDirection: 'column',
      transition: 'width .2s', flexShrink: 0,
      position: 'relative', zIndex: 10,
    }}>
      {/* Logo */}
      <div style={{
        padding: collapsed ? '20px 0' : '20px 16px',
        display: 'flex', alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        minHeight: 64,
      }}>
        {!collapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 9, background: COLORS.brand,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="#fff" strokeWidth="2"/>
                <circle cx="12" cy="12" r="4" fill="#fff"/>
                <circle cx="12" cy="12" r="1.5" fill={COLORS.brand}/>
              </svg>
            </div>
            <span style={{ fontWeight: 800, fontSize: 14, color: '#fff', letterSpacing: '-0.2px' }}>Baims Hub</span>
          </div>
        )}
        {collapsed && (
          <div style={{
            width: 32, height: 32, borderRadius: 9, background: COLORS.brand,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="#fff" strokeWidth="2"/>
              <circle cx="12" cy="12" r="4" fill="#fff"/>
              <circle cx="12" cy="12" r="1.5" fill={COLORS.brand}/>
            </svg>
          </div>
        )}
        <button
          onClick={onToggle}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'rgba(255,255,255,0.4)', padding: 4, borderRadius: 4,
            display: 'flex', alignItems: 'center',
          }}
        >
          {collapsed ? '›' : '‹'}
        </button>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {navItems.map(item => {
          const active = currentView === item.id;
          const hov = hovItem === item.id;
          const IconComp = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              onMouseEnter={() => setHovItem(item.id)}
              onMouseLeave={() => setHovItem(null)}
              style={{
                display: 'flex', alignItems: 'center',
                gap: 10, padding: collapsed ? '10px 0' : '10px 12px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                borderRadius: 8, border: 'none', cursor: 'pointer',
                background: active ? 'rgba(255,255,255,0.12)' : hov ? 'rgba(255,255,255,0.06)' : 'transparent',
                color: active ? '#fff' : 'rgba(255,255,255,0.55)',
                fontWeight: active ? 700 : 500, fontSize: 14,
                transition: 'all .15s', textAlign: 'left', width: '100%',
              }}
              title={collapsed ? item.label : ''}
            >
              <IconComp active={active} />
              {!collapsed && <span>{item.label}</span>}
              {active && !collapsed && (
                <div style={{
                  width: 4, height: 4, borderRadius: 2,
                  background: COLORS.brand, marginLeft: 'auto',
                }} />
              )}
            </button>
          );
        })}
      </nav>

      {/* User */}
      {currentUser && (
        <div style={{
          padding: collapsed ? '12px 0' : '12px 14px',
          borderTop: '1px solid rgba(255,255,255,0.07)',
          display: 'flex', alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between', gap: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Avatar memberId={currentUser.id} size={32} />
            {!collapsed && (
              <div>
                <div style={{ fontWeight: 700, fontSize: 12, color: '#fff', display: 'flex', alignItems: 'center', gap: 5 }}>
                  {currentUser.name}
                  <span title={dbConnected ? 'Supabase connected' : 'localStorage only'} style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: dbConnected ? COLORS.green : '#6B7280',
                    flexShrink: 0,
                  }} />
                </div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>{currentUser.role}</div>
              </div>
            )}
          </div>
          {!collapsed && (
            <button
              onClick={onLogout}
              title="Logout"
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'rgba(255,255,255,0.35)', padding: 4, fontSize: 14,
                borderRadius: 4, display: 'flex', alignItems: 'center',
              }}
              onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.35)'}
            >
              ⏻
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// Icon components
function NavMeetingIcon({ active }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={active ? '#fff' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  );
}
function NavBoardIcon({ active }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={active ? '#fff' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    </svg>
  );
}
function NavMyBoardIcon({ active }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={active ? '#fff' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  );
}
function NavDashIcon({ active }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={active ? '#fff' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="9" height="9"/><rect x="13" y="2" width="9" height="9"/><rect x="2" y="13" width="9" height="9"/><rect x="13" y="13" width="9" height="9"/>
    </svg>
  );
}
function NavSearchIcon({ active }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={active ? '#fff' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  );
}

function NavSetupIcon({ active }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={active ? '#fff' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
    </svg>
  );
}

window.Sidebar = Sidebar;
