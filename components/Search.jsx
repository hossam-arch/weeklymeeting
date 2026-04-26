
function Search({ currentUser, tasks, needs, decisions, updates, meetings }) {
  const [query, setQuery] = React.useState('');
  const [answer, setAnswer] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [followUp, setFollowUp] = React.useState('');
  const inputRef = React.useRef(null);

  // Key comes from config.js (authoritative) — no user input needed
  function getApiKey() {
    const cfg = window.BGH_CONFIG?.anthropicKey;
    if (cfg && cfg !== 'YOUR_ANTHROPIC_API_KEY') return cfg;
    return null;
  }

  const suggestions = [
    `What did ${currentUser.name} ask for this week?`,
    'How is Orcas UAE performing?',
    'Which decisions are still open?',
    "What's blocking the Australia launch?",
    'Show me overdue tasks',
    'What does Bader need from Khalaf?',
  ];

  function buildSystemPrompt() {
    let ctx = `You are the Baims Group Hub intelligence assistant. You have access to all meeting notes, tasks, decisions, cross-team requests, and KPI data for the Baims Group leadership team. Answer questions concisely and accurately based only on the data provided. Cite your sources inline using [Meeting Apr 21], [Task #3], [KPI Orcas UAE] style references.\n\n`;

    // All meetings' updates (most recent first)
    const sortedMeetings = [...meetings].sort((a, b) => b.id.localeCompare(a.id));
    sortedMeetings.forEach(meeting => {
      const meetingUpdates = updates[meeting.id] || {};
      const hasNotes = TEAM.some(m => {
        const r = meetingUpdates[m.id] || {};
        return r.general || r.budget || r.needs || r.launch;
      });
      if (!hasNotes) return;
      const tag = meeting.status === 'Active' ? ' [CURRENT]' : '';
      ctx += `=== MEETING: ${meeting.label} (${meeting.dateRange})${tag} ===\n`;
      TEAM.forEach(member => {
        const row = meetingUpdates[member.id] || {};
        if (!row.general && !row.budget && !row.needs && !row.launch) return;
        ctx += `\n[${member.name} — ${member.role}]\n`;
        if (row.general) ctx += `  General: ${row.general}\n`;
        if (row.budget)  ctx += `  Budget: ${row.budget}\n`;
        if (row.needs)   ctx += `  Needs: ${row.needs}\n`;
        if (row.launch)  ctx += `  Launch/Projects: ${row.launch}\n`;
      });
      ctx += '\n';
    });

    // Tasks
    ctx += `\n=== TASKS ===\n`;
    tasks.filter(t => t.status === 'active').forEach((t, i) => {
      const owner = getTeamMember(t.ownerId);
      ctx += `[Task #${i+1}] ${t.title} | Owner: ${owner?.name} | Product: ${t.product} | Quadrant: ${t.quadrant} | Due: ${t.dueDate || 'none'} | ${t.isPrivate ? 'Private' : 'Public'}\n`;
    });

    // Needs
    ctx += `\n=== CROSS-TEAM REQUESTS ===\n`;
    needs.forEach((n, i) => {
      const from = getTeamMember(n.fromId);
      const to   = getTeamMember(n.toId);
      ctx += `[Need #${i+1}] From ${from?.name} → To ${to?.name}: "${n.description}" | Status: ${n.status} | Due: ${n.dueDate || 'none'}\n`;
    });

    // Decisions
    ctx += `\n=== DECISIONS ===\n`;
    decisions.forEach((d, i) => {
      const owner = getTeamMember(d.ownerId);
      ctx += `[Decision #${i+1}] ${d.topic} | Owner: ${owner?.name} | Status: ${d.status}`;
      if (d.outcome) ctx += ` | Outcome: ${d.outcome}`;
      if (d.notes)   ctx += ` | Notes: ${d.notes}`;
      ctx += '\n';
    });

    // Full KPI data — all 7 metrics per product
    ctx += `\n=== KPI DATA ===\n`;
    [KPI_DATA.orcas, KPI_DATA.baims, KPI_DATA.medmasters].forEach(prod => {
      ctx += `\n${prod.name}:\n`;
      prod.metrics.forEach(metric => {
        ctx += `  ${metric.label}:\n`;
        metric.rows.forEach(row => {
          const vs = row.actual >= row.target ? '✓' : '✗';
          const fmt = v => Number.isInteger(v) ? v.toLocaleString() : v;
          ctx += `    ${row.market}: ${fmt(row.actual)} / ${fmt(row.target)} ${vs}\n`;
        });
      });
    });

    return ctx;
  }

  async function search(q) {
    if (!q.trim()) return;
    const key = getApiKey();
    if (!key) { setError('AI search is not configured. Ask your admin to add the Anthropic API key to config.js.'); return; }

    setLoading(true);
    setError(null);
    setAnswer(null);

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': key,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: buildSystemPrompt(),
          messages: [{ role: 'user', content: q }],
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error?.message || `API error ${res.status}`);
      }

      const data = await res.json();
      setAnswer({ text: data.content[0].text, query: q });
      setQuery('');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setAnswer(null);
    setError(null);
    setQuery('');
    setFollowUp('');
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  return (
    <div style={{ height: '100vh', overflowY: 'auto', background: COLORS.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 20px' }}>
      <div style={{ width: '100%', maxWidth: 720 }}>

          {!answer ? (
          <>
            {/* Hero */}
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <h1 style={{ fontWeight: 800, fontSize: 28, color: COLORS.textPrimary, marginBottom: 8 }}>Ask anything</h1>
              <p style={{ fontSize: 15, color: COLORS.textSecondary }}>Search across meetings, tasks, KPIs, decisions and team updates</p>
            </div>

            {/* Search input */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: COLORS.textMuted, fontSize: 16 }}>🔍</span>
                <input
                  ref={inputRef}
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && search(query)}
                  placeholder="Ask anything…  e.g. How is Orcas UAE performing?"
                  style={{
                    width: '100%', padding: '12px 12px 12px 40px',
                    borderRadius: 10, border: `1.5px solid ${COLORS.border}`,
                    fontSize: 14, outline: 'none', background: '#fff',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  }}
                  onFocus={e => e.target.style.borderColor = COLORS.brand}
                  onBlur={e => e.target.style.borderColor = COLORS.border}
                />
              </div>
              <Btn variant="primary" onClick={() => search(query)} disabled={!query.trim() || loading}>
                {loading ? '…' : 'Ask'}
              </Btn>
            </div>

            {/* Suggestions */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
              {suggestions.map((s, i) => (
                <button key={i} onClick={() => search(s)}
                  style={{
                    padding: '7px 14px', borderRadius: 20, border: `1px solid ${COLORS.border}`,
                    background: '#fff', cursor: 'pointer', fontSize: 13, color: COLORS.textSecondary,
                    transition: 'all .15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = COLORS.brand; e.currentTarget.style.color = COLORS.brand; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = COLORS.border; e.currentTarget.style.color = COLORS.textSecondary; }}
                >
                  {s}
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            {/* Answer card */}
            <div style={{ marginBottom: 16 }}>
              <button onClick={reset}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: COLORS.brand, fontWeight: 600, padding: '4px 0', marginBottom: 16 }}>
                ← New search
              </button>

              <div style={{ background: '#fff', border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: COLORS.textMuted, marginBottom: 10 }}>
                  Q: {answer.query}
                </div>
                <div style={{
                  fontSize: 14, color: COLORS.textPrimary, lineHeight: 1.7,
                  whiteSpace: 'pre-wrap',
                }}>
                  {answer.text}
                </div>
              </div>

              {/* Follow-up */}
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ flex: 1, position: 'relative' }}>
                  <input
                    value={followUp}
                    onChange={e => setFollowUp(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && followUp.trim()) { search(followUp); setFollowUp(''); }}}
                    placeholder="Ask a follow-up…"
                    style={{
                      width: '100%', padding: '10px 12px',
                      borderRadius: 10, border: `1.5px solid ${COLORS.border}`,
                      fontSize: 13, outline: 'none', background: '#fff',
                    }}
                  />
                </div>
                <Btn variant="primary" size="sm" onClick={() => { if (followUp.trim()) { search(followUp); setFollowUp(''); } }}>
                  Ask
                </Btn>
              </div>
            </div>
          </>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', padding: 32 }}>
            <div style={{ display: 'inline-flex', gap: 6, alignItems: 'center', color: COLORS.textSecondary, fontSize: 14 }}>
              <span style={{ animation: 'pulse 1s infinite' }}>●</span>
              <span style={{ animation: 'pulse 1s .2s infinite' }}>●</span>
              <span style={{ animation: 'pulse 1s .4s infinite' }}>●</span>
              <span style={{ marginLeft: 8 }}>Thinking…</span>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ padding: 16, background: COLORS.redLight, border: `1px solid ${COLORS.red}44`, borderRadius: 10, color: COLORS.red, fontSize: 13, marginTop: 16 }}>
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: 32, fontSize: 12, color: COLORS.textMuted }}>
          {getApiKey()
            ? <span>AI search ready · powered by Claude</span>
            : <span style={{ color: COLORS.amber }}>⚠ Add anthropicKey to config.js to enable search</span>
          }
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

window.Search = Search;
