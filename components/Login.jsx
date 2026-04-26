
function Login({ mode: initialMode = 'login' }) {
  const [mode, setMode]         = React.useState(initialMode); // 'login' | 'forgot' | 'reset'
  const [email, setEmail]       = React.useState('');
  const [password, setPassword] = React.useState('');
  const [newPw, setNewPw]       = React.useState('');
  const [confirmPw, setConfirmPw] = React.useState('');
  const [showPw, setShowPw]     = React.useState(false);
  const [loading, setLoading]   = React.useState(false);
  const [error, setError]       = React.useState(null);
  const [success, setSuccess]   = React.useState(null);

  // Detect PASSWORD_RECOVERY event from Supabase (when coming from the reset email link)
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

  function clearMessages() { setError(null); setSuccess(null); }

  async function handleSignIn(e) {
    e.preventDefault();
    if (!email.trim() || !password) { setError('Please enter your email and password.'); return; }
    setLoading(true);
    clearMessages();
    const { error } = await DB.signIn(email.trim().toLowerCase(), password);
    setLoading(false);
    if (error) setError(error.message === 'Invalid login credentials'
      ? 'Incorrect email or password.'
      : error.message);
    // On success: App.jsx onAuthChange handles session → sets currentUser
  }

  async function handleForgot(e) {
    e.preventDefault();
    if (!email.trim()) { setError('Please enter your email address.'); return; }
    setLoading(true);
    clearMessages();
    const { error } = await DB.resetPassword(
      email.trim().toLowerCase(),
      window.location.origin + window.location.pathname
    );
    setLoading(false);
    if (error) { setError(error.message); return; }
    setSuccess('Reset link sent! Check your email and click the link to set a new password.');
  }

  async function handleReset(e) {
    e.preventDefault();
    if (newPw.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (newPw !== confirmPw) { setError('Passwords do not match.'); return; }
    setLoading(true);
    clearMessages();
    const { error } = await DB.updatePassword(newPw);
    setLoading(false);
    if (error) { setError(error.message); return; }
    setSuccess('Password updated! Signing you in…');
    // App.jsx onAuthChange (USER_UPDATED) handles redirect to the app
  }

  const currentWeek = MEETINGS_INIT[0];

  const inputStyle = {
    width: '100%', padding: '11px 14px', borderRadius: 9,
    border: `1.5px solid ${COLORS.border}`, fontSize: 14,
    outline: 'none', background: '#fff', boxSizing: 'border-box',
  };

  return (
    <div style={{
      minHeight: '100vh', background: 'linear-gradient(135deg, #F0FDF9 0%, #F5F6FA 60%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: 20,
    }}>
      {/* Logos */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <BaimsLogo size={48} />
          <OrcasLogo size={48} />
          <MedMastersLogo size={48} />
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
        width: '100%', maxWidth: 400,
        padding: '32px',
      }}>

        {/* ── SIGN IN ── */}
        {mode === 'login' && (
          <form onSubmit={handleSignIn}>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: COLORS.textPrimary, marginBottom: 4 }}>
              Welcome back
            </h2>
            <p style={{ fontSize: 14, color: COLORS.textSecondary, marginBottom: 24 }}>
              Sign in with your team email
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.textSecondary, display: 'block', marginBottom: 5 }}>
                  Email
                </label>
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@orcas.io"
                  style={inputStyle} autoComplete="email" autoFocus
                  onFocus={e => e.target.style.borderColor = COLORS.brand}
                  onBlur={e => e.target.style.borderColor = COLORS.border}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.textSecondary, display: 'block', marginBottom: 5 }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    style={{ ...inputStyle, paddingRight: 42 }}
                    onFocus={e => e.target.style.borderColor = COLORS.brand}
                    onBlur={e => e.target.style.borderColor = COLORS.border}
                  />
                  <button type="button" onClick={() => setShowPw(v => !v)}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 15, color: COLORS.textMuted }}>
                    {showPw ? '🙈' : '👁'}
                  </button>
                </div>
              </div>
            </div>

            {error   && <div style={{ marginTop: 14, padding: '10px 14px', background: COLORS.redLight, borderRadius: 8, fontSize: 13, color: COLORS.red }}>{error}</div>}
            {success && <div style={{ marginTop: 14, padding: '10px 14px', background: COLORS.greenLight, borderRadius: 8, fontSize: 13, color: '#065F46' }}>{success}</div>}

            <button type="submit" disabled={loading}
              style={{
                marginTop: 20, width: '100%', padding: '12px',
                background: loading ? COLORS.border : COLORS.brand,
                color: loading ? COLORS.textMuted : '#fff',
                border: 'none', borderRadius: 9, fontSize: 14, fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer', transition: 'background .15s',
              }}>
              {loading ? 'Signing in…' : 'Sign in'}
            </button>

            <button type="button" onClick={() => { setMode('forgot'); clearMessages(); }}
              style={{ marginTop: 14, width: '100%', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: COLORS.brand, fontWeight: 600, padding: '4px 0' }}>
              Forgot password?
            </button>
          </form>
        )}

        {/* ── FORGOT PASSWORD ── */}
        {mode === 'forgot' && (
          <form onSubmit={handleForgot}>
            <button type="button" onClick={() => { setMode('login'); clearMessages(); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: COLORS.brand, fontWeight: 600, padding: '0 0 16px', display: 'block' }}>
              ← Back to sign in
            </button>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: COLORS.textPrimary, marginBottom: 4 }}>Reset password</h2>
            <p style={{ fontSize: 14, color: COLORS.textSecondary, marginBottom: 24 }}>
              Enter your email and we'll send you a reset link.
            </p>

            <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.textSecondary, display: 'block', marginBottom: 5 }}>Email</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@orcas.io"
              style={inputStyle} autoFocus
              onFocus={e => e.target.style.borderColor = COLORS.brand}
              onBlur={e => e.target.style.borderColor = COLORS.border}
            />

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
              {loading ? 'Sending…' : success ? 'Link sent ✓' : 'Send reset link'}
            </button>
          </form>
        )}

        {/* ── SET NEW PASSWORD ── */}
        {mode === 'reset' && (
          <form onSubmit={handleReset}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: COLORS.textPrimary, marginBottom: 4 }}>Set new password</h2>
            <p style={{ fontSize: 14, color: COLORS.textSecondary, marginBottom: 24 }}>
              Choose a new password for your account.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.textSecondary, display: 'block', marginBottom: 5 }}>New password</label>
                <input
                  type="password" value={newPw} onChange={e => setNewPw(e.target.value)}
                  placeholder="At least 8 characters"
                  style={inputStyle} autoFocus
                  onFocus={e => e.target.style.borderColor = COLORS.brand}
                  onBlur={e => e.target.style.borderColor = COLORS.border}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.textSecondary, display: 'block', marginBottom: 5 }}>Confirm password</label>
                <input
                  type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)}
                  placeholder="Repeat password"
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = COLORS.brand}
                  onBlur={e => e.target.style.borderColor = COLORS.border}
                />
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
