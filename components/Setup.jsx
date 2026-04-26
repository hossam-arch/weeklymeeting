
const IMPORT_TEMPLATE = [
  {
    meeting: {
      label: "Week 14",
      dateRange: "Mar 31 – Apr 6, 2026",
      startDate: "2026-03-31",
      endDate: "2026-04-06",
      chairmanId: "bader",
      status: "Complete",
      targetDuration: 90,
      actualDuration: 82,
    },
    updates: {
      shams:  { general: "Launched Ramadan campaign.", budget: "Within Q1 budget.", needs: "", launch: "Orcas Kuwait Q1 wrap-up." },
      amira:  { general: "Tutor network grew 8%.", budget: "On track.", needs: "", launch: "UAE soft launch prep." },
      yousef: { general: "Investor deck v3 sent.", budget: "Opex on target.", needs: "", launch: "Series A prep started." },
      ahmad:  { general: "March best month for Baims Kuwait.", budget: "CAC improving.", needs: "", launch: "GUST deal signed." },
      bader:  { general: "Sprint 12 complete.", budget: "Tool costs stable.", needs: "", launch: "Session replay scoped." },
      hossam: { general: "AWS migration 70% done.", budget: "Infra costs down.", needs: "", launch: "Metabase POC ready." },
      khalaf: { general: "20 tickets closed.", budget: "Dev tools on track.", needs: "", launch: "CI/CD improvements shipped." },
    },
    tasks: [
      { title: "Finalize GUST integration spec", ownerId: "ahmad", product: "Baims", quadrant: "do-first", dueDate: "2026-04-07", status: "complete" },
      { title: "Deploy Ramadan campaign assets", ownerId: "shams", product: "Orcas", quadrant: "do-first", dueDate: "2026-04-01", status: "complete" },
    ],
    needs: [
      { fromId: "bader", toId: "khalaf", description: "Review session replay backend spec", status: "done", product: "Orcas" },
    ],
    decisions: [
      { topic: "Proceed with GUST partnership", ownerId: "yousef", relevantIds: ["yousef", "ahmad"], status: "approved", outcome: "Approved. Ahmad to lead onboarding.", notes: "" },
    ],
  }
];

function Setup({ onConnected }) {
  const [tab, setTab] = React.useState('migrate');

  // ── DB status ─────────────────────────────────────────────────────────────
  const connected = DB.isConfigured();

  // ── Reset tab ─────────────────────────────────────────────────────────────
  const [resetStatus, setResetStatus] = React.useState('idle');
  const [resetMsg,    setResetMsg]    = React.useState('');

  async function resetDatabase() {
    if (!window.confirm('This will permanently delete ALL meetings, tasks, needs, decisions, and updates from the database AND clear your browser cache. Are you absolutely sure?')) return;
    setResetStatus('running'); setResetMsg('');
    try {
      await DB.clearAll();
      // Clear localStorage too
      ['bgh-meetings','bgh-tasks','bgh-needs','bgh-decisions','bgh-updates'].forEach(k => localStorage.removeItem(k));
      setResetStatus('done');
      setResetMsg('Database cleared. Reload the page to start fresh with empty data.');
    } catch (e) {
      setResetStatus('error');
      setResetMsg(e.message || 'Reset failed.');
    }
  }

  // ── Migrate tab ──────────────────────────────────────────────────────────
  const [migrateStatus, setMigrateStatus] = React.useState('idle');
  const [migrateMsg,    setMigrateMsg]    = React.useState('');

  async function migrateFromLocalStorage() {
    setMigrateStatus('running'); setMigrateMsg('');
    try {
      const meetings  = JSON.parse(localStorage.getItem('bgh-meetings')  || '[]');
      const tasks     = JSON.parse(localStorage.getItem('bgh-tasks')     || '[]');
      const needs     = JSON.parse(localStorage.getItem('bgh-needs')     || '[]');
      const decisions = JSON.parse(localStorage.getItem('bgh-decisions') || '[]');
      const updates   = JSON.parse(localStorage.getItem('bgh-updates')   || '{}');
      await DB.syncMeetings(meetings);
      await DB.syncTasks(tasks);
      await DB.syncNeeds(needs);
      await DB.syncDecisions(decisions);
      await DB.syncUpdates(updates);
      setMigrateStatus('done');
      setMigrateMsg(`Migrated ${meetings.length} meetings, ${tasks.length} tasks, ${needs.length} needs, ${decisions.length} decisions.`);
      if (onConnected) onConnected();
    } catch (e) {
      setMigrateStatus('error');
      setMigrateMsg(e.message || 'Migration failed.');
    }
  }

  // ── Import tab ───────────────────────────────────────────────────────────
  const [importJson,    setImportJson]    = React.useState('');
  const [importStatus,  setImportStatus]  = React.useState('idle');
  const [importMsg,     setImportMsg]     = React.useState('');
  const [importResults, setImportResults] = React.useState([]);

  async function runImport() {
    if (!connected) { setImportMsg('Database not connected. Check config.js.'); setImportStatus('error'); return; }
    let bundles;
    try {
      const parsed = JSON.parse(importJson.trim());
      bundles = Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      setImportStatus('error');
      setImportMsg('Invalid JSON — check the format matches the template.');
      return;
    }
    setImportStatus('running'); setImportMsg(''); setImportResults([]);
    const results = [];
    for (const bundle of bundles) {
      try {
        const m = await DB.importMeetingBundle(bundle);
        results.push({ ok: true, label: m.label });
      } catch (e) {
        results.push({ ok: false, label: bundle.meeting?.label || '?', error: e.message || String(e) });
      }
    }
    setImportResults(results);
    const allOk = results.every(r => r.ok);
    setImportStatus(allOk ? 'done' : 'error');
    setImportMsg(allOk
      ? `${results.length} meeting(s) imported successfully.`
      : 'Some imports failed — see details below.');
    if (allOk && onConnected) onConnected();
  }

  function downloadTemplate() {
    const blob = new Blob([JSON.stringify(IMPORT_TEMPLATE, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'bgh-import-template.json';
    a.click();
  }

  const tabs = [
    { id: 'migrate', label: 'Migrate current data' },
    { id: 'import',  label: 'Import historical meetings' },
    { id: 'reset',   label: '⚠ Reset database' },
  ];

  return (
    <div style={{ height: '100vh', overflowY: 'auto', background: COLORS.bg, padding: '32px 28px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontWeight: 800, fontSize: 22, color: COLORS.textPrimary, marginBottom: 4 }}>
            Data Management
          </h1>
          <p style={{ fontSize: 14, color: COLORS.textSecondary }}>
            Migrate existing browser data or import historical meetings into the shared database.
          </p>
        </div>

        {/* DB status pill */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '6px 14px', borderRadius: 20, marginBottom: 24,
          background: connected ? COLORS.greenLight : COLORS.redLight,
          border: `1px solid ${connected ? COLORS.green : COLORS.red}44`,
        }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: connected ? COLORS.green : COLORS.red }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: connected ? COLORS.green : COLORS.red }}>
            {connected ? 'Database connected' : 'Database not connected — update config.js'}
          </span>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: `1px solid ${COLORS.border}`, marginBottom: 24 }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: '9px 18px', border: 'none', background: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: tab === t.id ? 700 : 500,
              color: tab === t.id ? COLORS.brand : COLORS.textSecondary,
              borderBottom: tab === t.id ? `2px solid ${COLORS.brand}` : '2px solid transparent',
              transition: 'all .15s',
            }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── MIGRATE ── */}
        {tab === 'migrate' && (
          <Card>
            <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 8 }}>
              Push this browser's data → Supabase
            </h3>
            <p style={{ fontSize: 13, color: COLORS.textSecondary, lineHeight: 1.6, marginBottom: 16 }}>
              Uploads everything currently saved in your browser (meetings, tasks, needs, decisions,
              member updates) to the shared database. Run this once on the first device you set up.
            </p>
            <div style={{ marginBottom: 16 }}>
              {[
                { key: 'bgh-meetings',  label: 'Meetings' },
                { key: 'bgh-tasks',     label: 'Tasks' },
                { key: 'bgh-needs',     label: 'Needs' },
                { key: 'bgh-decisions', label: 'Decisions' },
                { key: 'bgh-updates',   label: 'Update rows' },
              ].map(({ key, label }) => {
                const raw = localStorage.getItem(key);
                const count = raw
                  ? (key === 'bgh-updates'
                      ? Object.values(JSON.parse(raw)).reduce((s, v) => s + Object.keys(v).length, 0)
                      : JSON.parse(raw).length)
                  : 0;
                return (
                  <div key={key} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom:`1px solid ${COLORS.borderLight}`, fontSize:13 }}>
                    <span style={{ color: COLORS.textSecondary }}>{label}</span>
                    <strong>{count}</strong>
                  </div>
                );
              })}
            </div>
            {migrateMsg && (
              <div style={{
                padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 14,
                background: migrateStatus === 'error' ? COLORS.redLight : COLORS.greenLight,
                color: migrateStatus === 'error' ? COLORS.red : COLORS.green,
                border: `1px solid ${migrateStatus === 'error' ? COLORS.red : COLORS.green}44`,
              }}>
                {migrateMsg}
              </div>
            )}
            <Btn
              variant="primary"
              onClick={migrateFromLocalStorage}
              disabled={!connected || migrateStatus === 'running'}
            >
              {migrateStatus === 'running' ? 'Migrating…' : '⬆ Push to database'}
            </Btn>
          </Card>
        )}

        {/* ── IMPORT ── */}
        {tab === 'import' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Card>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <h3 style={{ fontWeight: 700, fontSize: 15 }}>Import historical meetings</h3>
                <Btn size="sm" onClick={downloadTemplate}>⬇ Download template</Btn>
              </div>
              <p style={{ fontSize: 13, color: COLORS.textSecondary, lineHeight: 1.6, marginBottom: 14 }}>
                Paste a JSON array of past meeting bundles. Each bundle includes the meeting plus
                its member updates, tasks, needs, and decisions. Multiple meetings can be imported at once.
              </p>
              <Textarea
                label="Paste JSON here"
                value={importJson}
                onChange={setImportJson}
                placeholder={'[\n  {\n    "meeting": { "label": "Week 14", ... },\n    "updates": { "shams": { ... }, ... },\n    "tasks": [...],\n    "needs": [...],\n    "decisions": [...]\n  }\n]'}
                rows={12}
              />
              {importMsg && (
                <div style={{
                  padding: '10px 14px', borderRadius: 8, fontSize: 13, marginTop: 12,
                  background: importStatus === 'done' ? COLORS.greenLight : importStatus === 'error' ? COLORS.redLight : COLORS.blueLight,
                  color: importStatus === 'done' ? COLORS.green : importStatus === 'error' ? COLORS.red : COLORS.blue,
                  border: `1px solid ${importStatus === 'done' ? COLORS.green : importStatus === 'error' ? COLORS.red : COLORS.blue}44`,
                }}>
                  {importMsg}
                </div>
              )}
              {importResults.length > 0 && (
                <div style={{ marginTop: 10 }}>
                  {importResults.map((r, i) => (
                    <div key={i} style={{ display:'flex', alignItems:'center', gap:8, padding:'5px 0', fontSize:13 }}>
                      <span>{r.ok ? '✅' : '❌'}</span>
                      <span style={{ fontWeight:600 }}>{r.label}</span>
                      {r.error && <span style={{ color: COLORS.red, fontSize:12 }}>{r.error}</span>}
                    </div>
                  ))}
                </div>
              )}
              <div style={{ marginTop: 14, display: 'flex', gap: 8 }}>
                <Btn variant="primary" onClick={runImport} disabled={!importJson.trim() || importStatus === 'running'}>
                  {importStatus === 'running' ? 'Importing…' : '⬆ Import to database'}
                </Btn>
                <Btn size="sm" onClick={() => { setImportJson(''); setImportStatus('idle'); setImportMsg(''); setImportResults([]); }}>
                  Clear
                </Btn>
              </div>
            </Card>

            {/* Format reference */}
            <Card style={{ background: COLORS.grayLight }}>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>JSON format reference</div>
              <pre style={{ fontFamily: 'monospace', fontSize: 11, color: COLORS.textSecondary, lineHeight: 1.7, whiteSpace: 'pre-wrap', margin: 0 }}>{
`[
  {
    "meeting": {
      "label":          "Week 14",
      "dateRange":      "Mar 31 – Apr 6, 2026",
      "startDate":      "2026-03-31",
      "endDate":        "2026-04-06",
      "chairmanId":     "yousef",      // shams|amira|yousef|ahmad|bader|hossam|khalaf
      "status":         "Complete",   // Draft | Active | Complete
      "targetDuration": 90,
      "actualDuration": 82
    },
    "updates": {
      "shams":  { "general": "...", "budget": "...", "needs": "", "launch": "..." },
      "amira":  { "general": "...", "budget": "...", "needs": "", "launch": "..." },
      "yousef": { "general": "...", "budget": "...", "needs": "", "launch": "..." },
      "ahmad":  { "general": "...", "budget": "...", "needs": "", "launch": "..." },
      "bader":  { "general": "...", "budget": "...", "needs": "", "launch": "..." },
      "hossam": { "general": "...", "budget": "...", "needs": "", "launch": "..." },
      "khalaf": { "general": "...", "budget": "...", "needs": "", "launch": "..." }
    },
    "tasks": [
      {
        "title":    "Fix login bug",
        "ownerId":  "khalaf",
        "product":  "Orcas",          // Orcas | Baims | MedMasters | Group
        "quadrant": "do-first",       // do-first | schedule | delegate | eliminate
        "dueDate":  "2026-04-05",
        "status":   "complete"        // active | complete
      }
    ],
    "needs": [
      {
        "fromId":      "shams",
        "toId":        "yousef",
        "description": "Approve Q2 budget",
        "status":      "done",        // pending | in-progress | done
        "product":     "Group"
      }
    ],
    "decisions": [
      {
        "topic":       "Launch UAE market",
        "ownerId":     "yousef",
        "relevantIds": ["yousef", "amira"],
        "status":      "approved",    // open | approved | deferred
        "outcome":     "Approved for May.",
        "notes":       ""
      }
    ]
  }
]`}
              </pre>
            </Card>
          </div>
        )}
        {/* ── RESET ── */}
        {tab === 'reset' && (
          <Card style={{ border: `1.5px solid ${COLORS.red}44` }}>
            <h3 style={{ fontWeight: 700, fontSize: 15, color: COLORS.red, marginBottom: 8 }}>
              ⚠ Reset Database
            </h3>
            <p style={{ fontSize: 13, color: COLORS.textSecondary, lineHeight: 1.6, marginBottom: 16 }}>
              Permanently deletes <strong>all records</strong> from Supabase (meetings, tasks, needs, decisions, updates)
              and clears your browser cache. Use this to start fresh and populate the system with real data.
              <br /><strong style={{ color: COLORS.red }}>This cannot be undone.</strong>
            </p>
            {resetMsg && (
              <div style={{
                padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 14,
                background: resetStatus === 'error' ? COLORS.redLight : COLORS.greenLight,
                color: resetStatus === 'error' ? COLORS.red : COLORS.green,
                border: `1px solid ${resetStatus === 'error' ? COLORS.red : COLORS.green}44`,
              }}>
                {resetMsg}
              </div>
            )}
            <Btn
              variant="danger"
              onClick={resetDatabase}
              disabled={!connected || resetStatus === 'running'}
            >
              {resetStatus === 'running' ? 'Clearing…' : '🗑 Clear all database records'}
            </Btn>
          </Card>
        )}

      </div>
    </div>
  );
}

window.Setup = Setup;
