
function Login({ mode: initialMode = 'pick' }) {
  // modes: 'pick' → 'password' → (app) | 'forgot' | 'reset'
  const [mode, setMode]             = React.useState(initialMode);
  const [selected, setSelected]     = React.useState(null); // TEAM member
  const [password, setPassword]     = React.useState('');
  const [newPw, setNewPw]           = React.useState('');
  const [confirmPw, setConfirmPw]   = React.useState('');
  const [showPw, setShowPw]         = React.useState(false);
  const [hovered, setHovered]       = React.useState(null);
  const [loading, setLoading]       = React.useState(false);
  const [error, setError]           = React.useState(null);
  const [success, setSuccess]       = React.useState(null);

  // Detect Supabase PASSWORD_RECOVERY event (when user arrives via reset email link)
  React.useEffect(() => {
    if (!DB.isConfigured()) return;
    const { data: { subscription } } = DB.onAuthChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setMode('reset');
        setError(null);
        setSuccess(null);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  React.useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  function clear() { setError(null); setSuccess(null); }

  function pickMember(member) {
    setSelected(member);
    setPassword('');
    setError(null);
    setSuccess(null);
    setMode('password');
  }

  function backToPick() {
    setMode('pick');
    setSelected(null);
    setPassword('');
    clear();
  }

  async function handleSignIn(e) {
    e.preventDefault();
    if (!password) { setError('Please enter your password.'); return; }
    setLoading(true); clear();

    const { error } = await DB.signIn(selected.email, password);

    if (!error) { setLoading(false); return; } // success — App.jsx handles session

    if (error.message === 'Invalid login credentials') {
      // Account may not exist yet — try to auto-create it on first login
      const { data, error: signUpError } = await DB.signUp(selected.email, password);
      if (signUpError) {
        // "User already registered" means account exists but password is wrong
        setError('Incorrect password. Use "Forgot password?" to reset it.');
      } else if (data?.session) {
        // Account created + immediately signed in (email confirmation disabled in Supabase)
        // App.jsx onAuthChange handles the rest — nothing to do here
      } else {
        // Email confirmation is ON in Supabase — user must confirm before signing in
        setError('Account created! Check your inbox for a confirmation email, then sign in.');
      }
    } else {
      setError(error.message);
    }

    setLoading(false);
  }

  async function handleForgot(e) {
    e.preventDefault();
    setLoading(true); clear();
    const { error } = await DB.resetPassword(
      selected.email,
      window.location.origin + window.location.pathname
    );
    setLoading(false);
    if (error) { setError(error.message); return; }
    setSuccess('If this email has an account, a reset link was sent. Check your inbox (and spam folder).');
  }

  async function handleReset(e) {
    e.preventDefault();
    if (newPw.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (newPw !== confirmPw) { setError('Passwords do not match.'); return; }
    setLoading(true); clear();
    const { error } = await DB.updatePassword(newPw);
    setLoading(false);
    if (error) { setError(error.message); return; }
    setSuccess('Password updated! Signing you in…');
    // App.jsx USER_UPDATED event handles redirect
  }

  const currentWeek = MEETINGS_INIT[0];

  const inputStyle = {
    width: '100%', padding: '11px 14px', borderRadius: 9,
    border: `1.5px solid ${COLORS.border}`, fontSize: 14,
    outline: 'none', background: '#fff', boxSizing: 'border-box',
    transition: 'border-color .15s',
  };

  const cardWidth = mode === 'pick' ? 460 : 400;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #F0FDF9 0%, #F5F6FA 60%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: 20,
    }}>
      {/* Logos + title */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <BaimsLogo size={48} /><OrcasLogo size={48} /><MedMastersLogo size={48} />
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: 800, fontSize: 20, color: COLORS.textPrimary, letterSpacing: '-0.4px' }}>
            Baims' Group Leadership Hub
          </div>
          <div style={{ fontSize: 13, color: COLORS.textSecondary, marginTop: 3 }}>Leadership workspace</div>
        </div>
      </div>

      {/* Card */}
      <div style={{
        background: '#fff', borderRadius: 16,
        border: `1px solid ${COLORS.border}`,
        boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
        width: '100%', maxWidth: cardWidth,
        padding: '32px',
        transition: 'max-width .2s',
      }}>

        {/* ── PICK WHO YOU ARE ── */}
        {mode === 'pick' && (
          <>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: COLORS.textPrimary, marginBottom: 4 }}>Who are you?</h2>
            <p style={{ fontSize: 14, color: COLORS.textSecondary, marginBottom: 24 }}>Select your profile to continue</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {TEAM.map(member => (
                <div
                  key={member.id}
                  onClick={() => pickMember(member)}
                  onMouseEnter={() => setHovered(member.id)}
                  onMouseLeave={() => setHovered(null)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '11px 14px', borderRadius: 10,
                    border: `1.5px solid ${hovered === member.id ? member.color : COLORS.border}`,
                    cursor: 'pointer',
                    background: hovered === member.id ? member.color + '08' : '#fff',
                    transition: 'all .15s',
                  }}
                >
                  <Avatar memberId={member.id} size={36} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: COLORS.textPrimary }}>{member.name}</div>
                    <div style={{ fontSize: 12, color: COLORS.textSecondary }}>{member.role}</div>
                  </div>
                  <div style={{ fontSize: 12, color: COLORS.textMuted, flexShrink: 0 }}>{member.email}</div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── ENTER PASSWORD ── */}
        {mode === 'password' && selected && (
          <form onSubmit={handleSignIn}>
            <button type="button" onClick={backToPick}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: COLORS.brand, fontWeight: 600, padding: '0 0 20px', display: 'block' }}>
              ← Back
            </button>

            {/* Selected user */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, padding: '12px 14px', background: selected.color + '0D', borderRadius: 10, border: `1.5px solid ${selected.color}33` }}>
              <Avatar memberId={selected.id} size={40} />
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, color: COLORS.textPrimary }}>{selected.name}</div>
                <div style={{ fontSize: 12, color: COLORS.textSecondary }}>{selected.email}</div>
              </div>
            </div>

            <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.textSecondary, display: 'block', marginBottom: 5 }}>Password</label>
            <div style={{ position: 'relative', marginBottom: 4 }}>
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                style={{ ...inputStyle, paddingRight: 42 }}
                autoFocus
                onFocus={e => e.target.style.borderColor = COLORS.brand}
                onBlur={e => e.target.style.borderColor = COLORS.border}
              />
              <button type="button" onClick={() => setShowPw(v => !v)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 15, color: COLORS.textMuted }}>
                {showPw ? '🙈' : '👁'}
              </button>
            </div>

            {error   && <div style={{ marginTop: 12, padding: '10px 14px', background: COLORS.redLight, borderRadius: 8, fontSize: 13, color: COLORS.red }}>{error}</div>}
            {success && <div style={{ marginTop: 12, padding: '10px 14px', background: COLORS.greenLight, borderRadius: 8, fontSize: 13, color: '#065F46' }}>{success}</div>}

            <button type="submit" disabled={loading}
              style={{
                marginTop: 18, width: '100%', padding: '12px',
                background: loading ? COLORS.border : COLORS.brand,
                color: loading ? COLORS.textMuted : '#fff',
                border: 'none', borderRadius: 9, fontSize: 14, fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer', transition: 'background .15s',
              }}>
              {loading ? 'Signing in…' : 'Sign in'}
            </button>

            <button type="button"
              onClick={() => { setMode('forgot'); clear(); }}
              style={{ marginTop: 14, width: '100%', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: COLORS.brand, fontWeight: 600, padding: '4px 0' }}>
              Forgot password?
            </button>
          </form>
        )}

        {/* ── FORGOT PASSWORD ── */}
        {mode === 'forgot' && selected && (
          <form onSubmit={handleForgot}>
            <button type="button" onClick={() => { setMode('password'); clear(); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: COLORS.brand, fontWeight: 600, padding: '0 0 20px', display: 'block' }}>
              ← Back to sign in
            </button>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: COLORS.textPrimary, marginBottom: 4 }}>Reset password</h2>
            <p style={{ fontSize: 14, color: COLORS.textSecondary, marginBottom: 20 }}>
              We'll send a reset link to:
            </p>
            <div style={{ padding: '10px 14px', background: COLORS.grayLight, borderRadius: 8, fontSize: 14, fontWeight: 600, color: COLORS.textPrimary, marginBottom: 4 }}>
              {selected.email}
            </div>

            {error   && <div style={{ marginTop: 12, padding: '10px 14px', background: COLORS.redLight, borderRadius: 8, fontSize: 13, color: COLORS.red }}>{error}</div>}
            {success && <div style={{ marginTop: 12, padding: '10px 14px', background: COLORS.greenLight, borderRadius: 8, fontSize: 13, color: '#065F46' }}>{success}</div>}

            <button type="submit" disabled={loading || !!success}
              style={{
                marginTop: 18, width: '100%', padding: '12px',
                background: (loading || success) ? COLORS.border : COLORS.brand,
                color: (loading || success) ? COLORS.textMuted : '#fff',
                border: 'none', borderRadius: 9, fontSize: 14, fontWeight: 700,
                cursor: (loading || success) ? 'not-allowed' : 'pointer',
              }}>
              {loading ? 'Sending…' : success ? 'Link sent ✓' : 'Send reset link'}
            </button>
          </form>
        )}

        {/* ── SET NEW PASSWORD (from email link) ── */}
        {mode === 'reset' && (
          <form onSubmit={handleReset}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: COLORS.textPrimary, marginBottom: 4 }}>Set new password</h2>
            <p style={{ fontSize: 14, color: COLORS.textSecondary, marginBottom: 24 }}>Choose a new password for your account.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.textSecondary, display: 'block', marginBottom: 5 }}>New password</label>
                <input type="password" value={newPw} onChange={e => setNewPw(e.target.value)}
                  placeholder="At least 8 characters" style={inputStyle} autoFocus
                  onFocus={e => e.target.style.borderColor = COLORS.brand}
                  onBlur={e => e.target.style.borderColor = COLORS.border} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.textSecondary, display: 'block', marginBottom: 5 }}>Confirm password</label>
                <input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)}
                  placeholder="Repeat password" style={inputStyle}
                  onFocus={e => e.target.style.borderColor = COLORS.brand}
                  onBlur={e => e.target.style.borderColor = COLORS.border} />
              </div>
            </div>

            {error   && <div style={{ marginTop: 14, padding: '10px 14px', background: COLORS.redLight, borderRadius: 8, fontSize: 13, color: COLORS.red }}>{error}</div>}
            {success && <div style={{ marginTop: 14, padding: '10px 14px', background: COLORS.greenLight, borderRadius: 8, fontSize: 13, color: '#065F46' }}>{success}</div>}

            <button type="submit" disabled={loading || !!success}
              style={{
                marginTop: 20, width: '100%', padding: '12px',
                background: (loading || success) ? COLORS.border : COLORS.brand,
                color: (loading || success) ? COLORS.textMuted : '#fff',
                border: 'none', borderRadius: 9, fontSize: 14, fontWeight: 700,
                cursor: (loading || success) ? 'not-allowed' : 'pointer',
              }}>
              {loading ? 'Updating…' : success ? 'Password updated ✓' : 'Set password'}
            </button>
          </form>
        )}
      </div>

      {/* Footer */}
      <div style={{ marginTop: 24, fontSize: 12, color: COLORS.textMuted }}>
        {currentWeek.label} · {currentWeek.dateRange}
      </div>
    </div>
  );
}

window.Login = Login;
