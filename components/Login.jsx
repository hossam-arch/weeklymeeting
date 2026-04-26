
function Login({ onLogin }) {
  const [hovered, setHovered] = React.useState(null);
  const currentWeek = MEETINGS_INIT[0];

  return (
    <div style={{
      minHeight: '100vh', background: COLORS.bg,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: 20,
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 40 }}>
        <div style={{
          width: 48, height: 48, borderRadius: 14,
          background: COLORS.brand,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="#fff" strokeWidth="2"/>
            <circle cx="12" cy="12" r="4" fill="#fff"/>
            <circle cx="12" cy="12" r="1.5" fill={COLORS.brand}/>
          </svg>
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: 18, color: COLORS.textPrimary, letterSpacing: '-0.3px' }}>Baims Group</div>
          <div style={{ fontSize: 12, color: COLORS.textSecondary, marginTop: -1 }}>Hub</div>
        </div>
      </div>

      {/* Card */}
      <div style={{
        background: COLORS.card, borderRadius: 16,
        border: `1px solid ${COLORS.border}`,
        boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
        width: '100%', maxWidth: 440,
        padding: '32px 32px 28px',
      }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: COLORS.textPrimary, marginBottom: 4 }}>
          Who are you?
        </h2>
        <p style={{ fontSize: 14, color: COLORS.textSecondary, marginBottom: 24 }}>
          Select your profile to continue
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {TEAM.map(member => (
            <div
              key={member.id}
              onClick={() => onLogin(member)}
              onMouseEnter={() => setHovered(member.id)}
              onMouseLeave={() => setHovered(null)}
              style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '12px 16px', borderRadius: 10,
                border: `1.5px solid ${hovered === member.id ? member.color : COLORS.border}`,
                cursor: 'pointer',
                background: hovered === member.id ? member.color + '08' : '#fff',
                transition: 'all .15s',
              }}
            >
              <Avatar memberId={member.id} size={36} />
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: COLORS.textPrimary }}>{member.name}</div>
                <div style={{ fontSize: 12, color: COLORS.textSecondary }}>{member.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ marginTop: 24, fontSize: 12, color: COLORS.textMuted }}>
        {currentWeek.label} · {currentWeek.dateRange}
      </div>
    </div>
  );
}

window.Login = Login;
