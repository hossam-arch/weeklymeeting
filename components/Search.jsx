
function Search({ currentUser, tasks, needs, decisions, updates, meetings }) {
  const [query, setQuery]     = React.useState('');
  const [history, setHistory] = React.useState([]); // [{ id, query, text }]
  const [loading, setLoading] = React.useState(false);
  const [error, setError]     = React.useState(null);
  const [followUp, setFollowUp] = React.useState('');
  const [expanded, setExpanded] = React.useState({}); // history item expand state
  const inputRef = React.useRef(null);

  const current = history[0] || null;
  const past    = history.slice(1);

  const suggestions = [
    `What did ${currentUser.name} ask for this week?`,
    'How is Orcas UAE performing?',
    'Which decisions are still open?',
    "What's blocking the Australia launch?",
    'Show me overdue tasks',
    'What does Bader need from Khalaf?',
  ];

  function renderMarkdown(text) {
    if (!window.marked) return text;
    return window.marked.parse(text, { breaks: true, gfm: true });
  }

  function buildSystemPrompt() {
    let ctx = `You are the Baims Group Hub intelligence assistant. You have access to all meeting notes, tasks, decisions, cross-team requests, and KPI data for the Baims Group leadership team. Answer questions concisely and accurately based only on the data provided. Cite your sources inline using [Meeting Apr 21], [Task #3], [KPI Orcas UAE] style references. Format your responses using markdown: use **bold** for emphasis, tables for structured data, and > blockquotes for notes or highlights.\n\n`;

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

    ctx += `\n=== TASKS ===\n`;
    tasks.filter(t => t.status === 'active').forEach((t, i) => {
      const owner = getTeamMember(t.ownerId);
      ctx += `[Task #${i+1}] ${t.title} | Owner: ${owner?.name} | Product: ${t.product} | Quadrant: ${t.quadrant} | Due: ${t.dueDate || 'none'} | ${t.isPrivate ? 'Private' : 'Public'}\n`;
    });

    ctx += `\n=== CROSS-TEAM REQUESTS ===\n`;
    needs.forEach((n, i) => {
      const from = getTeamMember(n.fromId);
      const to   = getTeamMember(n.toId);
      ctx += `[Need #${i+1}] From ${from?.name} → To ${to?.name}: "${n.description}" | Status: ${n.status} | Due: ${n.dueDate || 'none'}\n`;
    });

    ctx += `\n=== DECISIONS ===\n`;
    decisions.forEach((d, i) => {
      const owner = getTeamMember(d.ownerId);
      ctx += `[Decision #${i+1}] ${d.topic} | Owner: ${owner?.name} | Status: ${d.status}`;
      if (d.outcome) ctx += ` | Outcome: ${d.outcome}`;
      if (d.notes)   ctx += ` | Notes: ${d.notes}`;
      ctx += '\n';
    });

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
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 1500,
          system: buildSystemPrompt(),
          messages: [{ role: 'user', content: q }],
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error?.message || `API error ${res.status}`);
      }

      const data = await res.json();
      const entry = { id: Date.now(), query: q, text: data.content[0].text };
      setHistory(prev => [entry, ...prev]);
      setQuery('');
      setFollowUp('');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setHistory([]);
    setError(null);
    setQuery('');
    setFollowUp('');
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  const mdStyles = `
    .md-body { font-size: 14px; color: #111827; line-height: 1.75; }
    .md-body p { margin: 0 0 10px; }
    .md-body p:last-child { margin-bottom: 0; }
    .md-body strong { font-weight: 700; color: #0F172A; }
    .md-body em { font-style: italic; }
    .md-body h1,.md-body h2,.md-body h3 { font-weight: 700; margin: 16px 0 8px; color: #0F172A; }
    .md-body h1 { font-size: 18px; } .md-body h2 { font-size: 16px; } .md-body h3 { font-size: 14px; }
    .md-body ul,.md-body ol { padding-left: 20px; margin: 6px 0 10px; }
    .md-body li { margin-bottom: 4px; }
    .md-body blockquote {
      border-left: 3px solid #2D6A4F; background: #F0FDF4;
      margin: 10px 0; padding: 10px 14px; border-radius: 0 6px 6px 0;
      color: #166534; font-size: 13px;
    }
    .md-body blockquote p { margin: 0; }
    .md-body table { width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 13px; }
    .md-body th {
      background: #F1F5F9; font-weight: 700; text-align: left;
      padding: 8px 12px; border: 1px solid #E2E8F0; color: #334155;
    }
    .md-body td { padding: 7px 12px; border: 1px solid #E2E8F0; color: #374151; }
    .md-body tr:nth-child(even) td { background: #F8FAFC; }
    .md-body code {
      background: #F1F5F9; border: 1px solid #E2E8F0; border-radius: 4px;
      padding: 1px 5px; font-size: 12px; font-family: 'SF Mono', Menlo, monospace; color: #0F172A;
    }
    .md-body pre {
      background: #0F172A; border-radius: 8px; padding: 14px 16px; margin: 10px 0; overflow-x: auto;
    }
    .md-body pre code {
      background: none; border: none; color: #E2E8F0; font-size: 12px; padding: 0;
    }
    .md-body hr { border: none; border-top: 1px solid #E5E7EB; margin: 14px 0; }
    @keyframes pulse {
      0%, 100% { opacity: 0.3; }
      50% { opacity: 1; }
    }
  `;

  return (
    <div style={{ height: '100vh', overflowY: 'auto', background: COLORS.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 20px' }}>
      <style>{mdStyles}</style>
      <div style={{ width: '100%', maxWidth: 760 }}>

        {!current ? (
          <>
            {/* Hero */}
            <div style={{ textAlign: 'center', marginBottom: 36 }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>✦</div>
              <h1 style={{ fontWeight: 800, fontSize: 28, color: COLORS.textPrimary, marginBottom: 8 }}>Ask anything</h1>
              <p style={{ fontSize: 15, color: COLORS.textSecondary }}>Search across meetings, tasks, KPIs, decisions and team updates</p>
            </div>

            {/* Search input */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: COLORS.textMuted, fontSize: 15 }}>🔍</span>
                <input
                  ref={inputRef}
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && search(query)}
                  placeholder="Ask anything…  e.g. How is Orcas UAE performing?"
                  style={{
                    width: '100%', padding: '13px 14px 13px 42px',
                    borderRadius: 12, border: `1.5px solid ${COLORS.border}`,
                    fontSize: 14, outline: 'none', background: '#fff',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
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
                    padding: '7px 15px', borderRadius: 20, border: `1px solid ${COLORS.border}`,
                    background: '#fff', cursor: 'pointer', fontSize: 13, color: COLORS.textSecondary,
                    transition: 'all .15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = COLORS.brand; e.currentTarget.style.color = COLORS.brand; e.currentTarget.style.background = '#F0FDF9'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = COLORS.border; e.currentTarget.style.color = COLORS.textSecondary; e.currentTarget.style.background = '#fff'; }}
                >
                  {s}
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            {/* Toolbar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <button onClick={reset}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: COLORS.brand, fontWeight: 600, padding: '4px 0', display: 'flex', alignItems: 'center', gap: 4 }}>
                ← New search
              </button>
              {history.length > 1 && (
                <span style={{ fontSize: 12, color: COLORS.textMuted }}>{history.length} searches this session</span>
              )}
            </div>

            {/* Current answer */}
            <div style={{
              background: '#fff', border: `1px solid ${COLORS.border}`, borderRadius: 14,
              overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.07)', marginBottom: 12,
            }}>
              {/* Question bar */}
              <div style={{ padding: '12px 20px', background: 'linear-gradient(135deg, #F0FDF9 0%, #E8F5F0 100%)', borderBottom: `1px solid ${COLORS.border}` }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: COLORS.brand, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Q</span>
                <span style={{ fontSize: 13, color: COLORS.textPrimary, marginLeft: 8, fontWeight: 500 }}>{current.query}</span>
              </div>
              {/* Answer body */}
              <div style={{ padding: '20px 24px' }}>
                <div
                  className="md-body"
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(current.text) }}
                />
              </div>
            </div>

            {/* Follow-up input */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
              <div style={{ flex: 1 }}>
                <input
                  value={followUp}
                  onChange={e => setFollowUp(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && followUp.trim()) search(followUp); }}
                  placeholder="Ask a follow-up…"
                  style={{
                    width: '100%', padding: '11px 14px',
                    borderRadius: 10, border: `1.5px solid ${COLORS.border}`,
                    fontSize: 13, outline: 'none', background: '#fff',
                  }}
                  onFocus={e => e.target.style.borderColor = COLORS.brand}
                  onBlur={e => e.target.style.borderColor = COLORS.border}
                />
              </div>
              <Btn variant="primary" size="sm" onClick={() => { if (followUp.trim()) search(followUp); }}>Ask</Btn>
            </div>

            {/* History */}
            {past.length > 0 && (
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
                  Previous searches
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {past.map(item => (
                    <div key={item.id} style={{
                      background: '#fff', border: `1px solid ${COLORS.border}`,
                      borderRadius: 10, overflow: 'hidden',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                    }}>
                      <button
                        onClick={() => setExpanded(p => ({ ...p, [item.id]: !p[item.id] }))}
                        style={{
                          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '11px 16px', background: 'none', border: 'none', cursor: 'pointer',
                          textAlign: 'left',
                        }}
                      >
                        <span style={{ fontSize: 13, color: COLORS.textPrimary, fontWeight: 500 }}>{item.query}</span>
                        <span style={{ fontSize: 11, color: COLORS.textMuted, marginLeft: 12, flexShrink: 0 }}>
                          {expanded[item.id] ? '▲ hide' : '▼ show'}
                        </span>
                      </button>
                      {expanded[item.id] && (
                        <div style={{ padding: '0 20px 16px', borderTop: `1px solid ${COLORS.border}`, paddingTop: 14 }}>
                          <div
                            className="md-body"
                            dangerouslySetInnerHTML={{ __html: renderMarkdown(item.text) }}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', padding: 40 }}>
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
        <div style={{ textAlign: 'center', marginTop: 36, fontSize: 12, color: COLORS.textMuted }}>
          AI search · powered by Claude
        </div>

      </div>
    </div>
  );
}

window.Search = Search;
