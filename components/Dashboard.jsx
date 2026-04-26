
// ─── RING SVG ─────────────────────────────────────────────────────────────────
function ProgressRing({ pct, color, size = 56 }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color + '22'} strokeWidth={6} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={6}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
    </svg>
  );
}

// ─── BAR ROW ──────────────────────────────────────────────────────────────────
function BarRow({ label, actual, target, color }) {
  const pct = Math.min((actual / target) * 100, 100);
  const isGood = actual >= target;
  const fmt = v => v >= 1000 ? '$' + (v/1000).toFixed(0) + 'K' : v.toLocaleString();
  return (
    <div style={{ marginBottom: 7 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
        <span style={{ fontSize: 11, color: COLORS.textSecondary }}>{label}</span>
        <span style={{ fontSize: 11, fontWeight: 700, color: isGood ? COLORS.green : COLORS.red }}>
          {fmt(actual)} / {fmt(target)}
        </span>
      </div>
      <div style={{ height: 5, background: color + '22', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: isGood ? COLORS.green : COLORS.red, borderRadius: 3, transition: 'width .5s' }} />
      </div>
    </div>
  );
}

// ─── PRODUCT CARD ─────────────────────────────────────────────────────────────
function ProductCard({ prod, onClick }) {
  const [hov, setHov] = React.useState(false);
  const pct = Math.round((prod.totalSales / prod.salesTarget) * 100);
  const isGood = prod.totalSales >= prod.salesTarget;
  const fmt = v => '$' + (v/1000).toFixed(0) + 'K';
  const salesMetric = prod.metrics[0]; // Sales $

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: '#fff', border: `1px solid ${COLORS.border}`,
        borderRadius: 12, padding: 20, cursor: 'pointer',
        boxShadow: hov ? '0 4px 16px rgba(0,0,0,0.09)' : '0 1px 3px rgba(0,0,0,0.04)',
        transition: 'box-shadow .15s', flex: 1,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 15, color: prod.color }}>{prod.name}</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: COLORS.textPrimary, marginTop: 2 }}>
            {fmt(prod.totalSales)}
          </div>
          <div style={{ fontSize: 12, color: isGood ? COLORS.green : COLORS.red, fontWeight: 600 }}>
            {pct}% of {fmt(prod.salesTarget)} target
          </div>
        </div>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ProgressRing pct={pct} color={isGood ? COLORS.green : COLORS.red} size={60} />
          <span style={{
            position: 'absolute', fontSize: 12, fontWeight: 800,
            color: isGood ? COLORS.green : COLORS.red,
          }}>{pct}%</span>
        </div>
      </div>
      <div>
        {salesMetric.rows.map(row => (
          <BarRow key={row.market} label={row.market} actual={row.actual} target={row.target} color={prod.color} />
        ))}
      </div>
    </div>
  );
}

// ─── PULSE CARD ───────────────────────────────────────────────────────────────
function PulseCard({ member, tasks, updates, onClick }) {
  const [hov, setHov] = React.useState(false);
  const myTasks = tasks.filter(t => t.ownerId === member.id && t.status === 'active');
  const qCounts = { 'do-first': 0, 'schedule': 0, 'delegate': 0, 'eliminate': 0 };
  myTasks.forEach(t => { if (qCounts[t.quadrant] !== undefined) qCounts[t.quadrant]++; });
  const lastEdit = updates?.lastEdited;

  const bars = [
    { q: 'do-first', color: COLORS.red },
    { q: 'schedule', color: COLORS.blue },
    { q: 'delegate', color: COLORS.amber },
    { q: 'eliminate', color: COLORS.gray },
  ];
  const total = myTasks.length || 1;

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: '#fff', border: `1px solid ${COLORS.border}`,
        borderRadius: 10, padding: '14px 16px', cursor: 'pointer',
        boxShadow: hov ? '0 4px 12px rgba(0,0,0,0.08)' : '0 1px 3px rgba(0,0,0,0.04)',
        transition: 'box-shadow .15s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <Avatar memberId={member.id} size={34} />
        <div>
          <div style={{ fontWeight: 700, fontSize: 13 }}>{member.name}</div>
          <div style={{ fontSize: 11, color: COLORS.textMuted }}>{member.role}</div>
        </div>
        <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
          <div style={{ fontWeight: 800, fontSize: 18, color: COLORS.textPrimary }}>{myTasks.length}</div>
          <div style={{ fontSize: 10, color: COLORS.textMuted }}>open tasks</div>
        </div>
      </div>

      {/* Quadrant distribution bar */}
      <div style={{ display: 'flex', height: 6, borderRadius: 3, overflow: 'hidden', gap: 1, marginBottom: 8 }}>
        {bars.map(b => (
          <div key={b.q} style={{
            flex: qCounts[b.q] / total,
            background: b.color,
            minWidth: qCounts[b.q] > 0 ? 4 : 0,
            transition: 'flex .4s',
          }} />
        ))}
        {myTasks.length === 0 && <div style={{ flex: 1, background: COLORS.borderLight }} />}
      </div>

      {lastEdit && (
        <div style={{ fontSize: 10, color: COLORS.textMuted }}>Updated {formatRelativeTime(lastEdit)}</div>
      )}
    </div>
  );
}

// ─── FLAG COL ────────────────────────────────────────────────────────────────
function FlagCol({ title, color, items, onItemClick }) {
  return (
    <div style={{ flex: 1 }}>
      <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: color }} />
        {title}
        <span style={{ fontWeight: 800, fontSize: 12, background: color + '22', color, padding: '1px 7px', borderRadius: 10, marginLeft: 4 }}>
          {items.length}
        </span>
      </div>
      {items.length === 0
        ? <div style={{ fontSize: 12, color: COLORS.textMuted, padding: '8px 0' }}>All clear ✓</div>
        : items.map((item, i) => (
          <div key={i} onClick={() => onItemClick && onItemClick(item)}
            style={{
              padding: '8px 12px', borderRadius: 7, marginBottom: 6, cursor: 'pointer',
              background: '#fff', border: `1px solid ${COLORS.border}`,
              borderLeft: `3px solid ${color}`, fontSize: 12,
              transition: 'box-shadow .15s',
            }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)'}
            onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
          >
            <div style={{ fontWeight: 600, color: COLORS.textPrimary, marginBottom: 2 }}>{item.title}</div>
            <div style={{ color: COLORS.textMuted, fontSize: 11 }}>{item.sub}</div>
          </div>
        ))
      }
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard({ currentUser, tasks, needs, decisions, updates, meetings, onNavigate }) {
  const [selectedIds, setSelectedIds] = React.useState(() => meetings.map(m => m.id));

  function toggleMeeting(id) {
    setSelectedIds(prev =>
      prev.includes(id)
        ? prev.length > 1 ? prev.filter(x => x !== id) : prev  // keep at least one
        : [...prev, id]
    );
  }

  const allSelected = selectedIds.length === meetings.length;

  // Derive the "reference" meeting for KPIs label (most recent selected)
  const refMeeting = meetings.find(m => selectedIds.includes(m.id)) || meetings[0];
  const meetingUpdates = (refMeeting && updates[refMeeting.id]) || {};

  // Filter tasks/needs/decisions to selected meetings
  const filteredTasks     = tasks.filter(t => !t.meetingId || selectedIds.includes(t.meetingId));
  const filteredNeeds     = needs.filter(n => !n.meetingId || selectedIds.includes(n.meetingId));
  const filteredDecisions = decisions.filter(d => !d.meetingId || selectedIds.includes(d.meetingId));

  // Overdue tasks
  const overdueTasks = filteredTasks.filter(t => t.status === 'active' && isOverdue(t.dueDate)).map(t => ({
    title: t.title,
    sub: `${getTeamMember(t.ownerId)?.name} · due ${formatDate(t.dueDate)}`,
    task: t,
  }));

  // Unresolved needs
  const unresolvedNeeds = filteredNeeds.filter(n => n.status !== 'done').map(n => ({
    title: n.description,
    sub: `${getTeamMember(n.fromId)?.name} → ${getTeamMember(n.toId)?.name}`,
    need: n,
  }));

  // Open decisions
  const openDecisions = filteredDecisions.filter(d => d.status === 'open').map(d => ({
    title: d.topic,
    sub: `Owner: ${getTeamMember(d.ownerId)?.name}`,
    decision: d,
  }));

  return (
    <div style={{ height: '100vh', overflowY: 'auto', background: COLORS.bg, padding: '24px 28px' }}>

      {/* Meeting selector */}
      <div style={{ marginBottom: 24, background: '#fff', border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: '12px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: COLORS.textSecondary }}>TIME RANGE</span>
          {meetings.map(m => {
            const sel = selectedIds.includes(m.id);
            return (
              <div key={m.id} onClick={() => toggleMeeting(m.id)}
                style={{
                  padding: '4px 12px', borderRadius: 20, cursor: 'pointer', fontSize: 12, fontWeight: 600,
                  background: sel ? COLORS.brand : '#F3F4F6',
                  color: sel ? '#fff' : COLORS.textSecondary,
                  border: `1.5px solid ${sel ? COLORS.brand : 'transparent'}`,
                  transition: 'all .15s',
                }}>
                {m.label}
              </div>
            );
          })}
          {!allSelected && (
            <button onClick={() => setSelectedIds(meetings.map(m => m.id))}
              style={{ fontSize: 11, color: COLORS.brand, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
              Select all
            </button>
          )}
          <span style={{ fontSize: 11, color: COLORS.textMuted, marginLeft: 'auto' }}>
            {filteredTasks.filter(t => t.status === 'active').length} active tasks across {selectedIds.length} meeting{selectedIds.length > 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Section 1 — Products */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 16 }}>
          <h2 style={{ fontWeight: 800, fontSize: 18, color: COLORS.textPrimary }}>KPIs</h2>
          <span style={{ fontSize: 13, color: COLORS.textMuted }}>
            {refMeeting ? `${refMeeting.label} · ${refMeeting.dateRange}` : ''}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {[KPI_DATA.orcas, KPI_DATA.baims, KPI_DATA.medmasters].map(prod => (
            <ProductCard key={prod.name} prod={prod} onClick={() => onNavigate('meeting')} />
          ))}
        </div>
      </div>

      {/* Section 2 — Team */}
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontWeight: 800, fontSize: 18, color: COLORS.textPrimary, marginBottom: 16 }}>Team</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
          {TEAM.map(member => (
            <PulseCard
              key={member.id}
              member={member}
              tasks={filteredTasks}
              updates={meetingUpdates[member.id]}
              onClick={() => onNavigate('board')}
            />
          ))}
        </div>
      </div>

      {/* Section 3 — Flags */}
      <div>
        <h2 style={{ fontWeight: 800, fontSize: 18, color: COLORS.textPrimary, marginBottom: 16 }}>Flags</h2>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', background: '#fff', border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 20 }}>
          <FlagCol
            title="Overdue Tasks" color={COLORS.red} items={overdueTasks}
            onItemClick={() => onNavigate('board')}
          />
          <div style={{ width: 1, background: COLORS.border }} />
          <FlagCol
            title="Unresolved Needs" color={COLORS.amber} items={unresolvedNeeds}
            onItemClick={() => onNavigate('meeting')}
          />
          <div style={{ width: 1, background: COLORS.border }} />
          <FlagCol
            title="Open Decisions" color={COLORS.blue} items={openDecisions}
            onItemClick={() => onNavigate('meeting')}
          />
        </div>
      </div>
    </div>
  );
}

window.Dashboard = Dashboard;
