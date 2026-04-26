
// ─── TEMPLATE for importing a historical meeting ─────────────────────────────
const IMPORT_TEMPLATE = {
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
};

// ─── SETUP / IMPORT SCREEN ────────────────────────────────────────────────────
function Setup({ onConnected }) {
  // ── Tab state ─────────────────────────────────────────────────────────────
  const [tab, setTab] = React.useState('connect'); // 'connect' | 'import' | 'migrate'

  // ── Connect tab ──────────────────────────────────────────────────────────
  const [url,    setUrl]    = React.useState(() => localStorage.getItem('bgh-sb-url')  || '');
  const [key,    setKey]    = React.useState(() => localStorage.getItem('bgh-sb-key')  || '');
  const [status, setStatus] = React.useState(DB.isConfigured() ? 'connected' : 'idle'); // idle | testing | connected | error
  const [statusMsg, setStatusMsg] = React.useState('');

  async function connect() {
    if (!url.trim() || !key.trim()) return;
    setStatus('testing'); setStatusMsg('');
    try {
      DB.init(url.trim(), key.trim());
      await DB.testConnection();
      localStorage.setItem('bgh-sb-url', url.trim());
      localStorage.setItem('bgh-sb-key', key.trim());
      setStatus('connected');
      setStatusMsg('Connected successfully!');
    } catch (e) {
      setStatus('error');
      setStatusMsg(e.message || 'Connection failed. Check your URL and key.');
    }
  }

  function disconnect() {
    localStorage.removeItem('bgh-sb-url');
    localStorage.removeItem('bgh-sb-key');
    setStatus('idle'); setUrl(''); setKey('');
  }

  // ── Import tab ───────────────────────────────────────────────────────────
  const [importJson,   setImportJson]   = React.useState('');
  const [importStatus, setImportStatus] = React.useState('idle'); // idle | running | done | error
  const [importMsg,    setImportMsg]    = React.useState('');
  const [importResults, setImportResults] = React.useState([]);

  async function runImport() {
    if (!DB.isConfigured()) { setImportMsg('Connect to Supabase first.'); setImportStatus('error'); return; }
    let bundles;
    try {
      const parsed = JSON.parse(importJson.trim());
      bundles = Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      setImportStatus('error');
      setImportMsg('Invalid JSON. Check the format matches the template.');
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
    const json = JSON.stringify([IMPORT_TEMPLATE], null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'bgh-import-template.json';
    a.click();
  }

  // ── Migrate tab ──────────────────────────────────────────────────────────
  const [migrateStatus, setMigrateStatus] = React.useState('idle');
  const [migrateMsg,    setMigrateMsg]    = React.useState('');

  async function migrateFromLocalStorage() {
    if (!DB.isConfigured()) { setMigrateMsg('Connect to Supabase first.'); setMigrateStatus('error'); return; }
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

  // ── Render ────────────────────────────────────────────────────────────────
  const tabs = [
    { id: 'connect', label: '① Connect' },
    { id: 'migrate', label: '② Migrate current data' },
    { id: 'import',  label: '③ Import historical meetings' },
  ];

  return (
    <div style={{ height: '100vh', overflowY: 'auto', background: COLORS.bg, padding: '32px 28px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontWeight: 800, fontSize: 22, color: COLORS.textPrimary, marginBottom: 4 }}>
            Database Setup
          </h1>
          <p style={{ fontSize: 14, color: COLORS.textSecondary }}>
            Connect to Supabase to share data across the team in real-time, then migrate or import meeting history.
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 0, marginBottom: 24, borderBottom: `1px solid ${COLORS.border}` }}>
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

        {/* ── CONNECT TAB ── */}
        {tab === 'connect' && (
          <Card>
            {status === 'connected' ? (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <span style={{ fontSize: 22 }}>✅</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: COLORS.green }}>Connected to Supabase</div>
                    <div style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 2 }}>{url}</div>
                  </div>
                </div>
                <Btn size="sm" onClick={disconnect}>Disconnect</Btn>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <p style={{ fontSize: 13, color: COLORS.textSecondary, lineHeight: 1.6 }}>
                  Get these from your Supabase project: <strong>Dashboard → Settings → API</strong>
                </p>
                <Input
                  label="Project URL"
                  value={url}
                  onChange={setUrl}
                  placeholder="https://xxxxxxxxxxxx.supabase.co"
                />
                <Input
                  label="Anon / Public Key"
                  type="password"
                  value={key}
                  onChange={setKey}
                  placeholder="eyJhbGciOiJIUzI1NiIs..."
                />
                {statusMsg && (
                  <div style={{
                    padding: '10px 14px', borderRadius: 8, fontSize: 13,
                    background: status === 'error' ? COLORS.redLight : COLORS.greenLight,
                    color: status === 'error' ? COLORS.red : COLORS.green,
                    border: `1px solid ${status === 'error' ? COLORS.red : COLORS.green}44`,
                  }}>
                    {statusMsg}
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 4 }}>
                  <Btn variant="primary" onClick={connect} disabled={!url.trim() || !key.trim() || status === 'testing'}>
                    {status === 'testing' ? 'Testing…' : 'Connect & Test'}
                  </Btn>
                  <span style={{ fontSize: 12, color: COLORS.textMuted }}>
                    Credentials are stored in your browser only.
                  </span>
                </div>

                {/* Schema reminder */}
                <div style={{ marginTop: 8, padding: '12px 16px', background: COLORS.amberLight, borderRadius: 8, border: `1px solid ${COLORS.amber}44` }}>
                  <div style={{ fontWeight: 700, fontSize: 12, color: COLORS.amber, marginBottom: 4 }}>Before connecting</div>
                  <div style={{ fontSize: 12, color: COLORS.textSecondary, lineHeight: 1.6 }}>
                    Run <code style={{ background: '#fff', padding: '1px 5px', borderRadius: 4, fontFamily: 'monospace' }}>supabase-schema.sql</code> in your Supabase SQL Editor first.
                    The file is in the project root — open it and paste the full contents into
                    <strong> Supabase Dashboard → SQL Editor → New query → Run</strong>.
                  </div>
                </div>
              </div>
            )}
          </Card>
        )}

        {/* ── MIGRATE TAB ── */}
        {tab === 'migrate' && (
          <Card>
            <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 8 }}>Migrate current browser data → Supabase</h3>
            <p style={{ fontSize: 13, color: COLORS.textSecondary, lineHeight: 1.6, marginBottom: 16 }}>
              Pushes everything currently in your browser's localStorage (all meetings, tasks, needs, decisions,
              and member updates) into Supabase. Do this once after connecting — it makes your existing
              data available to the whole team.
            </p>
            <div style={{ marginBottom: 16 }}>
              {['bgh-meetings','bgh-tasks','bgh-needs','bgh-decisions','bgh-updates'].map(key => {
                const raw = localStorage.getItem(key);
                const count = raw
                  ? (key === 'bgh-updates'
                      ? Object.values(JSON.parse(raw)).reduce((s, v) => s + Object.keys(v).length, 0)
                      : JSON.parse(raw).length)
                  : 0;
                const labels = { 'bgh-meetings':'Meetings','bgh-tasks':'Tasks','bgh-needs':'Needs','bgh-decisions':'Decisions','bgh-updates':'Update rows' };
                return (
                  <div key={key} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom:`1px solid ${COLORS.borderLight}`, fontSize:13 }}>
                    <span style={{ color: COLORS.textSecondary }}>{labels[key]}</span>
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
              disabled={!DB.isConfigured() || migrateStatus === 'running'}
            >
              {migrateStatus === 'running' ? 'Migrating…' : '⬆ Push to Supabase'}
            </Btn>
            {!DB.isConfigured() && (
              <span style={{ fontSize: 12, color: COLORS.amber, marginLeft: 12 }}>Connect to Supabase first (tab ①)</span>
            )}
          </Card>
        )}

        {/* ── IMPORT TAB ── */}
        {tab === 'import' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Card>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <h3 style={{ fontWeight: 700, fontSize: 15 }}>Import historical meetings</h3>
                <Btn size="sm" onClick={downloadTemplate}>⬇ Download template</Btn>
              </div>
              <p style={{ fontSize: 13, color: COLORS.textSecondary, lineHeight: 1.6, marginBottom: 14 }}>
                Paste a JSON array of meeting bundles below. Each bundle includes one meeting record plus
                its updates, tasks, needs, and decisions. You can import multiple meetings at once.
                Download the template to see the exact expected format.
              </p>

              <Textarea
                label="Paste JSON here"
                value={importJson}
                onChange={setImportJson}
                placeholder={'[\n  {\n    "meeting": { "label": "Week 14", "status": "Complete", ... },\n    "updates": { "shams": { "general": "...", ... }, ... },\n    "tasks": [...],\n    "needs": [...],\n    "decisions": [...]\n  }\n]'}
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
                <Btn
                  variant="primary"
                  onClick={runImport}
                  disabled={!importJson.trim() || importStatus === 'running'}
                >
                  {importStatus === 'running' ? 'Importing…' : '⬆ Import to Supabase'}
                </Btn>
                <Btn size="sm" onClick={() => { setImportJson(''); setImportStatus('idle'); setImportMsg(''); setImportResults([]); }}>
                  Clear
                </Btn>
              </div>
              {!DB.isConfigured() && (
                <div style={{ marginTop: 10, fontSize: 12, color: COLORS.amber }}>Connect to Supabase first (tab ①)</div>
              )}
            </Card>

            {/* Format reference */}
            <Card style={{ background: COLORS.grayLight }}>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>JSON format reference</div>
              <div style={{ fontFamily: 'monospace', fontSize: 11, color: COLORS.textSecondary, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
{`[
  {
    "meeting": {
      "label":          "Week 14",            // required
      "dateRange":      "Mar 31 – Apr 6, 2026",
      "startDate":      "2026-03-31",
      "endDate":        "2026-04-06",
      "chairmanId":     "yousef",             // team member id
      "status":         "Complete",           // Draft | Active | Complete
      "targetDuration": 90,
      "actualDuration": 82
    },
    "updates": {
      "shams":  { "general": "...", "budget": "...", "needs": "", "launch": "..." },
      "amira":  { ... },   // one key per team member id
      "yousef": { ... },   // all fields optional
      "ahmad":  { ... },
      "bader":  { ... },
      "hossam": { ... },
      "khalaf": { ... }
    },
    "tasks": [
      {
        "title":    "Fix login bug",
        "ownerId":  "khalaf",                 // team member id
        "product":  "Orcas",                  // Orcas | Baims | MedMasters | Group
        "quadrant": "do-first",               // do-first | schedule | delegate | eliminate
        "dueDate":  "2026-04-05",
        "status":   "complete"                // active | complete
      }
    ],
    "needs": [
      {
        "fromId":      "shams",
        "toId":        "yousef",
        "description": "Approve Q2 budget",
        "status":      "done",               // pending | in-progress | done
        "product":     "Group"
      }
    ],
    "decisions": [
      {
        "topic":       "Launch UAE market",
        "ownerId":     "yousef",
        "relevantIds": ["yousef", "amira"],
        "status":      "approved",            // open | approved | deferred
        "outcome":     "Approved for May.",
        "notes":       ""
      }
    ]
  }
]`}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

window.Setup = Setup;
