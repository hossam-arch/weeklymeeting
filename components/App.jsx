
function App() {
  // ── AUTH ──────────────────────────────────────────────────────────────────
  // 'loading' while checking session, 'login', 'recovery' (password reset), 'app'
  const [authMode, setAuthMode]       = React.useState('loading');
  const [currentUser, setCurrentUser] = React.useState(null);
  const inRecoveryRef                 = React.useRef(false);

  React.useEffect(() => {
    if (!DB.isConfigured()) { setAuthMode('login'); return; }

    // Check for an existing session on page load
    DB.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const member = TEAM.find(m => m.email === session.user.email);
        if (member) { setCurrentUser(member); setAuthMode('app'); }
        else { setAuthMode('login'); }
      } else {
        setAuthMode('login');
      }
    });

    // React to auth events (sign-in, sign-out, password recovery)
    const { data: { subscription } } = DB.onAuthChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        inRecoveryRef.current = true;
        setAuthMode('recovery');
      } else if (event === 'SIGNED_IN' && session?.user) {
        if (!inRecoveryRef.current) {
          const member = TEAM.find(m => m.email === session.user.email);
          if (member) { setCurrentUser(member); setAuthMode('app'); }
          else { DB.signOut(); setAuthMode('login'); }
        }
      } else if (event === 'USER_UPDATED' && session?.user) {
        // After password reset the user is signed in — route to app
        inRecoveryRef.current = false;
        const member = TEAM.find(m => m.email === session.user.email);
        if (member) { setCurrentUser(member); setAuthMode('app'); }
        else { DB.signOut(); setAuthMode('login'); }
      } else if (event === 'SIGNED_OUT') {
        inRecoveryRef.current = false;
        setCurrentUser(null);
        setAuthMode('login');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // ── NAVIGATION ────────────────────────────────────────────────────────────
  const [view, setView] = React.useState('meeting');
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);

  // Supabase is auto-initialised from config.js when db.jsx loads.

  // ── SHARED STATE ──────────────────────────────────────────────────────────
  const [meetings, setMeetings] = React.useState(() => {
    const s = localStorage.getItem('bgh-meetings');
    return s ? JSON.parse(s) : MEETINGS_INIT;
  });
  const [tasks, setTasks] = React.useState(() => {
    const s = localStorage.getItem('bgh-tasks');
    return s ? JSON.parse(s) : TASKS_INIT;
  });
  const [needs, setNeeds] = React.useState(() => {
    const s = localStorage.getItem('bgh-needs');
    return s ? JSON.parse(s) : NEEDS_INIT;
  });
  const [decisions, setDecisions] = React.useState(() => {
    const s = localStorage.getItem('bgh-decisions');
    return s ? JSON.parse(s) : DECISIONS_INIT;
  });
  const [updates, setUpdates] = React.useState(() => {
    const s = localStorage.getItem('bgh-updates');
    return s ? JSON.parse(s) : UPDATES_INIT;
  });

  const [dbLoading, setDbLoading] = React.useState(false);
  const [dbError, setDbError]     = React.useState(null);
  // Gate: don't sync initial localStorage/INIT data to Supabase; only sync after DB load
  const dbLoadedRef  = React.useRef(false);
  // Prevent fetchAll from running more than once per login session
  const dbFetchedRef = React.useRef(false);

  // ── LOAD FROM SUPABASE (triggered by currentUser, once per login session) ─
  React.useEffect(() => {
    if (!DB.isConfigured()) {
      dbLoadedRef.current = true; // localStorage-only mode
      return;
    }
    if (!currentUser) {
      // User logged out — reset so next login triggers a fresh fetch
      dbFetchedRef.current = false;
      dbLoadedRef.current  = false;
      return;
    }
    if (dbFetchedRef.current) return; // already fetched this session
    dbFetchedRef.current = true;
    setDbLoading(true);
    setDbError(null);
    DB.fetchAll()
      .then(data => {
        if (data.meetings.length  > 0) { setMeetings(data.meetings);  localStorage.setItem('bgh-meetings',   JSON.stringify(data.meetings)); }
        if (data.tasks.length     > 0) { setTasks(data.tasks);        localStorage.setItem('bgh-tasks',      JSON.stringify(data.tasks)); }
        if (data.needs.length     > 0) { setNeeds(data.needs);        localStorage.setItem('bgh-needs',      JSON.stringify(data.needs)); }
        if (data.decisions.length > 0) { setDecisions(data.decisions);localStorage.setItem('bgh-decisions',  JSON.stringify(data.decisions)); }
        if (Object.keys(data.updates).length > 0) { setUpdates(data.updates); localStorage.setItem('bgh-updates', JSON.stringify(data.updates)); }
        dbLoadedRef.current = true;
      })
      .catch(e => {
        console.error('Supabase load:', e);
        setDbError(e.message || 'Failed to load data from Supabase.');
        dbLoadedRef.current = true;
      })
      .finally(() => setDbLoading(false));
  }, [currentUser]);

  // ── REALTIME SUBSCRIPTIONS ────────────────────────────────────────────────
  React.useEffect(() => {
    if (!DB.isConfigured() || !currentUser) return;
    const channel = DB.subscribe({
      onTask: ({ eventType, new: n, old: o }) => {
        if (eventType === 'DELETE') {
          setTasks(prev => prev.filter(t => t.id !== o.id));
        } else if (eventType === 'INSERT') {
          const t = DB.taskFromDB(n);
          setTasks(prev => prev.find(x => x.id === t.id) ? prev : [...prev, t]);
        } else {
          const t = DB.taskFromDB(n);
          setTasks(prev => prev.map(x => x.id === t.id ? t : x));
        }
      },
      onNeed: ({ eventType, new: n, old: o }) => {
        if (eventType === 'DELETE') {
          setNeeds(prev => prev.filter(x => x.id !== o.id));
        } else if (eventType === 'INSERT') {
          const item = DB.needFromDB(n);
          setNeeds(prev => prev.find(x => x.id === item.id) ? prev : [...prev, item]);
        } else {
          const item = DB.needFromDB(n);
          setNeeds(prev => prev.map(x => x.id === item.id ? item : x));
        }
      },
      onDecision: ({ eventType, new: n, old: o }) => {
        if (eventType === 'DELETE') {
          setDecisions(prev => prev.filter(x => x.id !== o.id));
        } else if (eventType === 'INSERT') {
          const d = DB.decisionFromDB(n);
          setDecisions(prev => prev.find(x => x.id === d.id) ? prev : [...prev, d]);
        } else {
          const d = DB.decisionFromDB(n);
          setDecisions(prev => prev.map(x => x.id === d.id ? d : x));
        }
      },
      onMeeting: ({ eventType, new: n, old: o }) => {
        if (eventType === 'DELETE') {
          setMeetings(prev => prev.filter(x => x.id !== o.id));
        } else if (eventType === 'INSERT') {
          const m = DB.meetingFromDB(n);
          setMeetings(prev => prev.find(x => x.id === m.id) ? prev : [m, ...prev]);
        } else {
          const m = DB.meetingFromDB(n);
          setMeetings(prev => prev.map(x => x.id === m.id ? m : x));
        }
      },
      onUpdate: ({ new: n }) => {
        if (!n) return;
        setUpdates(prev => ({
          ...prev,
          [n.meeting_id]: {
            ...(prev[n.meeting_id] || {}),
            [n.user_id]: {
              general: n.general || '', budget: n.budget || '',
              needs: n.needs_text || '', launch: n.launch || '',
              lastEdited: n.last_edited,
            },
          },
        }));
      },
    });
    return () => { channel && channel.unsubscribe && channel.unsubscribe(); };
  }, [currentUser]);

  // ── PERSIST (localStorage always; Supabase only after initial DB load) ────
  React.useEffect(() => {
    localStorage.setItem('bgh-meetings', JSON.stringify(meetings));
    if (DB.isConfigured() && dbLoadedRef.current) DB.syncMeetings(meetings).catch(console.error);
  }, [meetings]);

  React.useEffect(() => {
    localStorage.setItem('bgh-tasks', JSON.stringify(tasks));
    if (DB.isConfigured() && dbLoadedRef.current) DB.syncTasks(tasks).catch(console.error);
  }, [tasks]);

  React.useEffect(() => {
    localStorage.setItem('bgh-needs', JSON.stringify(needs));
    if (DB.isConfigured() && dbLoadedRef.current) DB.syncNeeds(needs).catch(console.error);
  }, [needs]);

  React.useEffect(() => {
    localStorage.setItem('bgh-decisions', JSON.stringify(decisions));
    if (DB.isConfigured() && dbLoadedRef.current) DB.syncDecisions(decisions).catch(console.error);
  }, [decisions]);

  React.useEffect(() => {
    localStorage.setItem('bgh-updates', JSON.stringify(updates));
    if (DB.isConfigured() && dbLoadedRef.current) DB.syncUpdates(updates).catch(console.error);
  }, [updates]);

  // ── AUTH HANDLERS ─────────────────────────────────────────────────────────
  async function handleLogout() {
    // Clear state immediately — don't wait for the SIGNED_OUT event
    setCurrentUser(null);
    setAuthMode('login');
    DB.signOut().catch(console.error); // fire-and-forget
  }

  function retryLoad() {
    dbFetchedRef.current = false;
    setDbError(null);
    setDbLoading(true);
    DB.fetchAll()
      .then(data => {
        if (data.meetings.length  > 0) setMeetings(data.meetings);
        if (data.tasks.length     > 0) setTasks(data.tasks);
        if (data.needs.length     > 0) setNeeds(data.needs);
        if (data.decisions.length > 0) setDecisions(data.decisions);
        if (Object.keys(data.updates).length > 0) setUpdates(data.updates);
        dbLoadedRef.current  = true;
        dbFetchedRef.current = true;
      })
      .catch(e => { setDbError(e.message || 'Failed to load data.'); })
      .finally(() => setDbLoading(false));
  }

  // Called by Setup after a successful import/migration to reload from Supabase
  function reloadFromDB() {
    if (!DB.isConfigured()) return;
    DB.fetchAll().then(data => {
      if (data.meetings.length  > 0) setMeetings(data.meetings);
      if (data.tasks.length     > 0) setTasks(data.tasks);
      if (data.needs.length     > 0) setNeeds(data.needs);
      if (data.decisions.length > 0) setDecisions(data.decisions);
      if (Object.keys(data.updates).length > 0) setUpdates(data.updates);
    }).catch(console.error);
  }

  // ── RENDER ────────────────────────────────────────────────────────────────
  if (authMode === 'loading') return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', color: COLORS.textSecondary, fontSize: 14 }}>
      Loading…
    </div>
  );
  if (authMode === 'login')    return <Login mode="pick" />;
  if (authMode === 'recovery') return <Login mode="reset" />;

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: COLORS.bg }}>
      <Sidebar
        currentView={view}
        onNavigate={setView}
        currentUser={currentUser}
        onLogout={handleLogout}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(v => !v)}
        dbConnected={DB.isConfigured()}
      />

      <main style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative' }}>
        {/* DB loading / error banners */}
        {dbLoading && (
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, zIndex: 50,
            background: COLORS.brand, color: '#fff',
            padding: '6px 16px', fontSize: 12, fontWeight: 600, textAlign: 'center',
          }}>
            Loading data from Supabase…
          </div>
        )}
        {dbError && !dbLoading && (
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, zIndex: 50,
            background: COLORS.red, color: '#fff',
            padding: '6px 16px', fontSize: 12, fontWeight: 600, textAlign: 'center',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
          }}>
            ⚠ Supabase load failed: {dbError}
            <button onClick={retryLoad}
              style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', cursor: 'pointer', borderRadius: 4, padding: '2px 8px', fontSize: 11 }}>
              Retry
            </button>
          </div>
        )}

        {view === 'meeting' && (
          <WeeklyMeeting
            currentUser={currentUser}
            meetings={meetings} setMeetings={setMeetings}
            updates={updates}   setUpdates={setUpdates}
            needs={needs}       setNeeds={setNeeds}
            decisions={decisions} setDecisions={setDecisions}
            tasks={tasks}
            onNavigateBoard={() => setView('board')}
          />
        )}
        {view === 'board' && (
          <GroupBoard
            currentUser={currentUser}
            tasks={tasks} setTasks={setTasks}
            meetings={meetings}
            onNavigate={setView}
          />
        )}
        {view === 'my-board' && (
          <MyBoard
            currentUser={currentUser}
            tasks={tasks} setTasks={setTasks}
            needs={needs} setNeeds={setNeeds}
            decisions={decisions} setDecisions={setDecisions}
            meetings={meetings}
          />
        )}
        {view === 'dashboard' && (
          <Dashboard
            currentUser={currentUser}
            tasks={tasks} needs={needs}
            decisions={decisions} updates={updates}
            meetings={meetings}
            onNavigate={setView}
          />
        )}
        {view === 'search' && (
          <Search
            currentUser={currentUser}
            tasks={tasks} needs={needs}
            decisions={decisions} updates={updates}
            meetings={meetings}
          />
        )}
        {view === 'setup' && (
          <Setup onConnected={reloadFromDB} />
        )}
      </main>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
