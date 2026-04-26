
function App() {
  // ── AUTH ──────────────────────────────────────────────────────────────────
  const [currentUser, setCurrentUser] = React.useState(() => {
    const saved = localStorage.getItem('bgh-user');
    return saved ? JSON.parse(saved) : null;
  });

  // ── NAVIGATION ────────────────────────────────────────────────────────────
  const [view, setView] = React.useState('meeting');
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);

  // ── STATE — shared across views ───────────────────────────────────────────
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

  // ── PERSISTENCE ───────────────────────────────────────────────────────────
  React.useEffect(() => { localStorage.setItem('bgh-meetings',  JSON.stringify(meetings));  }, [meetings]);
  React.useEffect(() => { localStorage.setItem('bgh-tasks',     JSON.stringify(tasks));     }, [tasks]);
  React.useEffect(() => { localStorage.setItem('bgh-needs',     JSON.stringify(needs));     }, [needs]);
  React.useEffect(() => { localStorage.setItem('bgh-decisions', JSON.stringify(decisions)); }, [decisions]);
  React.useEffect(() => { localStorage.setItem('bgh-updates',   JSON.stringify(updates));   }, [updates]);

  // ── AUTH HANDLERS ─────────────────────────────────────────────────────────
  function handleLogin(member) {
    localStorage.setItem('bgh-user', JSON.stringify(member));
    setCurrentUser(member);
  }

  function handleLogout() {
    localStorage.removeItem('bgh-user');
    setCurrentUser(null);
  }

  // ── RENDER ────────────────────────────────────────────────────────────────
  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  const sharedProps = { currentUser, tasks, setTasks, needs, setNeeds, decisions, setDecisions, updates, setUpdates, meetings, setMeetings };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: COLORS.bg }}>
      <Sidebar
        currentView={view}
        onNavigate={setView}
        currentUser={currentUser}
        onLogout={handleLogout}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(v => !v)}
      />

      <main style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {view === 'meeting' && (
          <WeeklyMeeting
            {...sharedProps}
            onNavigateBoard={(taskId) => setView('board')}
          />
        )}
        {view === 'board' && (
          <GroupBoard
            currentUser={currentUser}
            tasks={tasks}
            setTasks={setTasks}
            meetings={meetings}
            onNavigate={setView}
          />
        )}
        {view === 'my-board' && (
          <MyBoard
            currentUser={currentUser}
            tasks={tasks}
            setTasks={setTasks}
            needs={needs}
            meetings={meetings}
          />
        )}
        {view === 'dashboard' && (
          <Dashboard
            currentUser={currentUser}
            tasks={tasks}
            needs={needs}
            decisions={decisions}
            updates={updates}
            meetings={meetings}
            onNavigate={setView}
          />
        )}
        {view === 'search' && (
          <Search
            currentUser={currentUser}
            tasks={tasks}
            needs={needs}
            decisions={decisions}
            updates={updates}
            meetings={meetings}
          />
        )}
      </main>
    </div>
  );
}

// ── BOOT ─────────────────────────────────────────────────────────────────────
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
