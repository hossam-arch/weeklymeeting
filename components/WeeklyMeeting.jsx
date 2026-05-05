
// ─── MEETING LIST PANEL ───────────────────────────────────────────────────────
function MeetingListItem({ meeting, selected, onClick }) {
  const chairman = getTeamMember(meeting.chairmanId);
  const [hov, setHov] = React.useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding: '12px 16px', cursor: 'pointer',
        borderLeft: selected ? `3px solid ${COLORS.brand}` : '3px solid transparent',
        background: selected ? COLORS.brandLight : hov ? '#F9FAFB' : '#fff',
        borderBottom: `1px solid ${COLORS.borderLight}`,
        transition: 'all .15s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontWeight: 700, fontSize: 13, color: COLORS.textPrimary }}>{meeting.label}</span>
        <StatusBadge status={meeting.status} />
      </div>
      <div style={{ fontSize: 12, color: COLORS.textSecondary, marginBottom: 4 }}>{meeting.dateRange}</div>
      {chairman && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Avatar memberId={chairman.id} size={18} />
          <span style={{ fontSize: 11, color: COLORS.textMuted }}>{chairman.name}</span>
        </div>
      )}
    </div>
  );
}

function NewMeetingForm({ onSave, onCancel }) {
  const [startDate, setStartDate] = React.useState('');
  const [endDate, setEndDate]     = React.useState('');
  const [chairmanId, setChairmanId] = React.useState(TEAM[0].id);
  const [target, setTarget]       = React.useState('90');

  function save() {
    if (!startDate || !endDate) return;
    const s = new Date(startDate); const e = new Date(endDate);
    const weekNum = Math.ceil((((s - new Date(s.getFullYear(), 0, 1)) / 86400000) + 1) / 7);
    const fmt = d => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    onSave({
      id: generateId('week'),
      label: `Week ${weekNum}`,
      dateRange: `${fmt(s)} – ${fmt(e)}`,
      startDate, endDate,
      chairmanId,
      status: 'Draft',
      targetDuration: parseInt(target) || 90,
      actualDuration: null,
      createdAt: new Date().toISOString(),
    });
  }

  return (
    <div style={{ padding: 16, background: COLORS.brandLight, borderBottom: `1px solid ${COLORS.border}` }}>
      <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 12, color: COLORS.brand }}>New Meeting</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Input label="Start date" type="date" value={startDate} onChange={setStartDate} />
        <Input label="End date"   type="date" value={endDate}   onChange={setEndDate} />
        <Select label="Chairman" value={chairmanId} onChange={setChairmanId}
          options={TEAM.map(m => ({ value: m.id, label: m.name }))} />
        <Input label="Target duration (min)" type="number" value={target} onChange={setTarget} />
        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          <Btn variant="primary" size="sm" onClick={save}>Create</Btn>
          <Btn size="sm" onClick={onCancel}>Cancel</Btn>
        </div>
      </div>
    </div>
  );
}

// ─── KPI TAB ──────────────────────────────────────────────────────────────────
function KPIsTab() {
  const products = [KPI_DATA.orcas, KPI_DATA.baims, KPI_DATA.medmasters];

  function fmt(v) {
    if (v === null || v === undefined) return '–';
    if (v >= 1000) return '$' + (v / 1000).toFixed(0) + 'K';
    if (Number.isInteger(v)) return v.toLocaleString();
    return v.toFixed(1);
  }

  return (
    <div style={{ padding: 24, overflowX: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h3 style={{ fontWeight: 700, fontSize: 15, color: COLORS.textPrimary }}>KPIs — Week at a Glance</h3>
        <span style={{ fontSize: 12, color: COLORS.textMuted }}>Last synced from Metabase · <span style={{ color: COLORS.brand, cursor: 'pointer' }}>Refresh</span></span>
      </div>
      {products.map(prod => (
        <div key={prod.name} style={{ marginBottom: 32 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: prod.color, marginBottom: 10, paddingBottom: 6, borderBottom: `2px solid ${prod.color}22` }}>
            {prod.name}
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: COLORS.grayLight }}>
                <th style={{ textAlign: 'left', padding: '8px 12px', fontWeight: 600, color: COLORS.textSecondary, width: 130 }}>Metric</th>
                {prod.markets.map(m => (
                  <th key={m} colSpan={2} style={{ textAlign: 'center', padding: '8px 12px', fontWeight: 600, color: COLORS.textSecondary }}>{m}</th>
                ))}
              </tr>
              <tr style={{ background: COLORS.grayLight }}>
                <th style={{ padding: '4px 12px' }} />
                {prod.markets.map(m => (
                  <React.Fragment key={m}>
                    <th style={{ textAlign: 'center', padding: '4px 8px', fontSize: 11, fontWeight: 500, color: COLORS.textMuted }}>Actual</th>
                    <th style={{ textAlign: 'center', padding: '4px 8px', fontSize: 11, fontWeight: 500, color: COLORS.textMuted }}>Target</th>
                  </React.Fragment>
                ))}
              </tr>
            </thead>
            <tbody>
              {prod.metrics.map((metric, mi) => (
                <tr key={metric.label} style={{ background: mi % 2 === 0 ? '#fff' : '#FAFAFA', borderBottom: `1px solid ${COLORS.borderLight}` }}>
                  <td style={{ padding: '9px 12px', fontWeight: 600, color: COLORS.textSecondary, fontSize: 12 }}>{metric.label}</td>
                  {metric.rows.map(row => {
                    const isGood = row.actual >= row.target;
                    return (
                      <React.Fragment key={row.market}>
                        <td style={{ padding: '9px 8px', textAlign: 'center', fontWeight: 700, color: isGood ? COLORS.green : COLORS.red, fontSize: 13 }}>
                          {fmt(row.actual)}
                        </td>
                        <td style={{ padding: '9px 8px', textAlign: 'center', color: COLORS.textMuted, fontSize: 12 }}>
                          {fmt(row.target)}
                        </td>
                      </React.Fragment>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}

// ─── UPDATES TAB ──────────────────────────────────────────────────────────────
function UpdatesTab({ meetingId, currentUser, updates, setUpdates }) {
  const isAdmin = currentUser.id === 'hossam';
  const [editingId, setEditingId] = React.useState(null); // which member row is being edited
  const [draft, setDraft]         = React.useState({});
  const [flash, setFlash]         = React.useState(null);

  const meetingUpdates = updates[meetingId] || {};

  function startEdit(memberId) {
    const row = meetingUpdates[memberId] || { general: '', budget: '', needs: '', launch: '' };
    setDraft({ ...row });
    setEditingId(memberId);
  }

  function save() {
    const now = new Date().toISOString();
    setUpdates(prev => ({
      ...prev,
      [meetingId]: {
        ...(prev[meetingId] || {}),
        [editingId]: { ...draft, lastEdited: now },
      },
    }));
    setFlash(editingId);
    setEditingId(null);
    setTimeout(() => setFlash(null), 1500);
  }

  const cols = [
    { key: 'general', label: 'GENERAL UPDATE' },
    { key: 'budget',  label: 'BUDGET' },
    { key: 'needs',   label: 'I NEED / FROM' },
    { key: 'launch',  label: 'LAUNCH / PROJECTS' },
  ];

  return (
    <div style={{ overflow: 'auto' }}>
      {/* Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ background: COLORS.grayLight, borderBottom: `1px solid ${COLORS.border}` }}>
            <th style={{ padding: '10px 20px', textAlign: 'left', fontWeight: 600, fontSize: 11, color: COLORS.textSecondary, width: 180 }}>MEMBER</th>
            {cols.map(c => (
              <th key={c.key} style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600, fontSize: 11, color: COLORS.textSecondary }}>{c.label}</th>
            ))}
            <th style={{ width: 90 }} />
          </tr>
        </thead>
        <tbody>
          {TEAM.map(member => {
            const row = meetingUpdates[member.id] || {};
            const isMe = member.id === currentUser.id;
            const canEdit = isMe || isAdmin;
            const isEditing = editingId === member.id;
            const isFlashing = flash === member.id;
            return (
              <tr key={member.id} style={{
                borderBottom: `1px solid ${COLORS.border}`,
                background: isFlashing ? COLORS.greenLight : isMe ? '#FAFFFE' : '#fff',
                transition: 'background .4s',
              }}>
                {/* Member */}
                <td style={{ padding: '14px 20px', verticalAlign: 'top' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 3, height: 40, borderRadius: 2, background: member.color, flexShrink: 0 }} />
                    <Avatar memberId={member.id} size={32} />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13 }}>{member.name}</div>
                      <div style={{ fontSize: 11, color: COLORS.textMuted }}>{member.role}</div>
                      {row.lastEdited && (
                        <div style={{ fontSize: 10, color: COLORS.textMuted, marginTop: 2 }}>
                          {formatRelativeTime(row.lastEdited)}
                        </div>
                      )}
                    </div>
                  </div>
                </td>

                {/* Data cells */}
                {cols.map(col => (
                  <td key={col.key} style={{ padding: '14px 16px', verticalAlign: 'top', maxWidth: 220 }}>
                    {isEditing ? (
                      <textarea
                        value={draft[col.key] || ''}
                        onChange={e => setDraft(p => ({ ...p, [col.key]: e.target.value }))}
                        rows={3}
                        style={{
                          width: '100%', padding: '6px 8px', borderRadius: 6,
                          border: `1.5px solid ${COLORS.brand}`,
                          fontSize: 12, resize: 'vertical', fontFamily: 'inherit',
                          outline: 'none', background: '#fff',
                        }}
                      />
                    ) : (
                      <span style={{ fontSize: 13, color: row[col.key] ? COLORS.textPrimary : COLORS.textMuted, lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                        {row[col.key] || '—'}
                      </span>
                    )}
                  </td>
                ))}

                {/* Action cell */}
                <td style={{ padding: '14px 12px', verticalAlign: 'top', textAlign: 'right', whiteSpace: 'nowrap' }}>
                  {isEditing ? (
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      <Btn variant="primary" size="sm" onClick={save}>Save</Btn>
                      <Btn size="sm" onClick={() => setEditingId(null)}>Cancel</Btn>
                    </div>
                  ) : canEdit && !editingId ? (
                    <button onClick={() => startEdit(member.id)} style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: COLORS.textMuted, fontSize: 13, padding: '2px 6px', borderRadius: 4,
                    }}
                      onMouseEnter={e => e.currentTarget.style.color = COLORS.brand}
                      onMouseLeave={e => e.currentTarget.style.color = COLORS.textMuted}
                      title={isMe ? 'Edit my row' : `Edit ${member.name}'s row`}
                    >✎</button>
                  ) : null}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── NEEDS TAB ────────────────────────────────────────────────────────────────
function NeedsTab({ meetingId, currentUser, needs, setNeeds }) {
  const [showForm, setShowForm] = React.useState(false);
  const [form, setForm] = React.useState({ toId: TEAM[0].id, description: '', dueDate: '', product: 'Group' });

  // Show this meeting's needs + any unresolved needs from other meetings (carry-over)
  const meetingNeeds = needs.filter(n => n.meetingId === meetingId || n.status !== 'done');

  function addNeed() {
    if (!form.description.trim()) return;
    const newNeed = {
      id: generateId('n'),
      fromId: currentUser.id,
      toId: form.toId,
      description: form.description,
      status: 'pending',
      dueDate: form.dueDate,
      product: form.product,
      meetingId,
      createdAt: new Date().toISOString(),
    };
    setNeeds(prev => [...prev, newNeed]);
    setForm({ toId: TEAM[0].id, description: '', dueDate: '', product: 'Group' });
    setShowForm(false);
  }

  function markDone(id) {
    setNeeds(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, status: 'done' } : n);
      const changed = updated.find(n => n.id === id);
      if (DB.isConfigured() && changed) DB.updateNeed(changed).catch(console.error);
      return updated;
    });
  }

  function cancelNeed(id) {
    setNeeds(prev => prev.filter(n => n.id !== id));
    if (DB.isConfigured()) DB.deleteNeed(id).catch(console.error);
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h3 style={{ fontWeight: 700, fontSize: 15 }}>Cross-Team Requests</h3>
        <Btn variant="primary" size="sm" onClick={() => setShowForm(v => !v)}>+ Add Need</Btn>
      </div>

      {/* Add Form */}
      {showForm && (
        <Card style={{ marginBottom: 16, background: COLORS.brandLight, border: `1px solid ${COLORS.brand}44` }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <Select label="To" value={form.toId} onChange={v => setForm(p => ({ ...p, toId: v }))}
              options={TEAM.filter(m => m.id !== currentUser.id).map(m => ({ value: m.id, label: m.name }))} />
            <Select label="Product" value={form.product} onChange={v => setForm(p => ({ ...p, product: v }))}
              options={PRODUCTS.map(p => ({ value: p, label: p }))} />
          </div>
          <Textarea label="Description" value={form.description} onChange={v => setForm(p => ({ ...p, description: v }))} rows={2} placeholder="What do you need?" />
          <div style={{ marginTop: 8 }}>
            <Input label="Due date" type="date" value={form.dueDate} onChange={v => setForm(p => ({ ...p, dueDate: v }))} />
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <Btn variant="primary" size="sm" onClick={addNeed}>Add</Btn>
            <Btn size="sm" onClick={() => setShowForm(false)}>Cancel</Btn>
          </div>
        </Card>
      )}

      {meetingNeeds.length === 0 && !showForm
        ? <EmptyState icon="🤝" text="No cross-team requests for this meeting." />
        : meetingNeeds.map(need => {
            const from = getTeamMember(need.fromId);
            const to   = getTeamMember(need.toId);
            const isProvider  = need.toId === currentUser.id;
            const isRequester = need.fromId === currentUser.id;
            return (
              <Card key={need.id} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                      <Avatar memberId={need.fromId} size={24} />
                      <span style={{ fontWeight: 600, fontSize: 13 }}>{from?.name}</span>
                      <span style={{ color: COLORS.textMuted, fontSize: 12 }}>→</span>
                      <Avatar memberId={need.toId} size={24} />
                      <span style={{ fontWeight: 600, fontSize: 13 }}>{to?.name}</span>
                      <ProductChip product={need.product} />
                      {need.dueDate && (
                        <span style={{ fontSize: 11, color: isOverdue(need.dueDate) && need.status !== 'done' ? COLORS.red : COLORS.textMuted }}>
                          Due {formatDate(need.dueDate)}
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: 13, color: COLORS.textPrimary, lineHeight: 1.5, marginLeft: 32 }}>{need.description}</p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
                    <StatusBadge status={need.status} />
                    {isProvider && need.status !== 'done' && (
                      <Btn variant="success" size="sm" onClick={() => markDone(need.id)}>✓ Mark Done</Btn>
                    )}
                    {isRequester && need.status !== 'done' && (
                      <Btn variant="ghost" size="sm" onClick={() => cancelNeed(need.id)}>✕ Cancel</Btn>
                    )}
                  </div>
                </div>
              </Card>
            );
          })
      }
    </div>
  );
}

// ─── DECISIONS TAB ────────────────────────────────────────────────────────────
function DecisionsTab({ meetingId, currentUser, decisions, setDecisions }) {
  const [showForm, setShowForm] = React.useState(false);
  const [expanded, setExpanded] = React.useState(null);
  const [form, setForm] = React.useState({ topic: '', ownerId: currentUser.id, relevantIds: [], notes: '' });

  // Show this meeting's decisions + any open decisions from other meetings (carry-over)
  const meetingDecisions = decisions.filter(d => d.meetingId === meetingId || d.status === 'open');

  function addDecision() {
    if (!form.topic.trim()) return;
    setDecisions(prev => [...prev, {
      id: generateId('d'),
      topic: form.topic,
      ownerId: form.ownerId,
      relevantIds: form.relevantIds,
      status: 'open',
      outcome: '',
      notes: form.notes,
      meetingId,
      createdAt: new Date().toISOString(),
      approvedBy: null,
      approvedAt: null,
    }]);
    setForm({ topic: '', ownerId: currentUser.id, relevantIds: [], notes: '' });
    setShowForm(false);
  }

  function approve(id) {
    setDecisions(prev => {
      const updated = prev.map(d => d.id === id
        ? { ...d, status: 'approved', approvedBy: currentUser.id, approvedAt: new Date().toISOString() }
        : d);
      const changed = updated.find(d => d.id === id);
      if (DB.isConfigured() && changed) DB.updateDecision(changed).catch(console.error);
      return updated;
    });
  }

  function defer(id) {
    setDecisions(prev => {
      const updated = prev.map(d => d.id === id ? { ...d, status: 'deferred' } : d);
      const changed = updated.find(d => d.id === id);
      if (DB.isConfigured() && changed) DB.updateDecision(changed).catch(console.error);
      return updated;
    });
  }

  function deleteDecision(id) {
    if (!window.confirm('Delete this decision? This cannot be undone.')) return;
    setDecisions(prev => prev.filter(d => d.id !== id));
    if (DB.isConfigured()) DB.deleteDecision(id).catch(console.error);
  }

  function toggleRelevant(id) {
    setForm(p => ({
      ...p,
      relevantIds: p.relevantIds.includes(id)
        ? p.relevantIds.filter(x => x !== id)
        : [...p.relevantIds, id],
    }));
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h3 style={{ fontWeight: 700, fontSize: 15 }}>Decisions</h3>
        <Btn variant="primary" size="sm" onClick={() => setShowForm(v => !v)}>+ Add Decision</Btn>
      </div>

      {/* Add Form */}
      {showForm && (
        <Card style={{ marginBottom: 16, background: COLORS.brandLight, border: `1px solid ${COLORS.brand}44` }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Input label="Topic *" value={form.topic} onChange={v => setForm(p => ({ ...p, topic: v }))} placeholder="What needs to be decided?" />
            <Select label="Owner" value={form.ownerId} onChange={v => setForm(p => ({ ...p, ownerId: v }))}
              options={TEAM.map(m => ({ value: m.id, label: m.name }))} />
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.textSecondary, display: 'block', marginBottom: 6 }}>Relevant people</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {TEAM.map(m => (
                  <div key={m.id} onClick={() => toggleRelevant(m.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 5,
                      padding: '4px 8px', borderRadius: 20, cursor: 'pointer',
                      border: `1.5px solid ${form.relevantIds.includes(m.id) ? m.color : COLORS.border}`,
                      background: form.relevantIds.includes(m.id) ? m.color + '18' : '#fff',
                      fontSize: 12, fontWeight: 600, color: form.relevantIds.includes(m.id) ? m.color : COLORS.textSecondary,
                      transition: 'all .15s',
                    }}>
                    {m.name}
                  </div>
                ))}
              </div>
            </div>
            <Textarea label="Notes" value={form.notes} onChange={v => setForm(p => ({ ...p, notes: v }))} rows={2} />
            <div style={{ display: 'flex', gap: 8 }}>
              <Btn variant="primary" size="sm" onClick={addDecision}>Add</Btn>
              <Btn size="sm" onClick={() => setShowForm(false)}>Cancel</Btn>
            </div>
          </div>
        </Card>
      )}

      {meetingDecisions.length === 0 && !showForm
        ? <EmptyState icon="⚖️" text="No decisions recorded for this meeting." />
        : meetingDecisions.map(dec => {
            const owner = getTeamMember(dec.ownerId);
            const isOpen = expanded === dec.id;
            return (
              <Card key={dec.id} style={{ marginBottom: 10, cursor: 'pointer' }} onClick={() => setExpanded(isOpen ? null : dec.id)}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 700, fontSize: 14, color: COLORS.textPrimary }}>{dec.topic}</span>
                      <StatusBadge status={dec.status} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <Avatar memberId={dec.ownerId} size={20} />
                        <span style={{ fontSize: 12, color: COLORS.textSecondary }}>{owner?.name}</span>
                      </div>
                      {dec.relevantIds.length > 0 && (
                        <AvatarGroup memberIds={dec.relevantIds} size={20} />
                      )}
                      <span style={{ fontSize: 11, color: COLORS.textMuted }}>{formatRelativeTime(dec.createdAt)}</span>
                    </div>
                    {dec.outcome && (
                      <p style={{ marginTop: 6, fontSize: 13, color: COLORS.green, fontWeight: 600 }}>✓ {dec.outcome}</p>
                    )}
                    {isOpen && dec.notes && (
                      <p style={{ marginTop: 8, fontSize: 13, color: COLORS.textSecondary, lineHeight: 1.5, paddingTop: 8, borderTop: `1px solid ${COLORS.border}` }}>
                        {dec.notes}
                      </p>
                    )}
                    {isOpen && dec.approvedBy && (
                      <p style={{ marginTop: 6, fontSize: 11, color: COLORS.textMuted }}>
                        Approved by {getTeamMember(dec.approvedBy)?.name} · {formatRelativeTime(dec.approvedAt)}
                      </p>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                    {dec.status === 'open' && (
                      <>
                        <Btn variant="success" size="sm" onClick={() => approve(dec.id)}>✓ Approve</Btn>
                        <Btn size="sm" onClick={() => defer(dec.id)}>→ Defer</Btn>
                      </>
                    )}
                    {(dec.ownerId === currentUser.id || dec.status !== 'open') && (
                      <Btn variant="danger" size="sm" onClick={() => deleteDecision(dec.id)}>🗑</Btn>
                    )}
                  </div>
                </div>
              </Card>
            );
          })
      }
    </div>
  );
}

// ─── PUBLIC BOARD TAB ─────────────────────────────────────────────────────────
function PublicBoardTab({ meetingId, tasks }) {
  const publicTasks = tasks.filter(t => t.meetingId === meetingId && !t.isPrivate && t.status === 'active');
  const quadrants = [
    { id: 'do-first',  label: 'Do First',  sublabel: 'Urgent + Important',        accentColor: COLORS.red   },
    { id: 'schedule',  label: 'Schedule',  sublabel: 'Not Urgent + Important',     accentColor: COLORS.blue  },
    { id: 'delegate',  label: 'Delegate',  sublabel: 'Urgent + Not Important',     accentColor: COLORS.amber },
    { id: 'eliminate', label: 'Eliminate', sublabel: 'Not Urgent + Not Important', accentColor: COLORS.gray  },
  ];
  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <h3 style={{ fontWeight: 700, fontSize: 15 }}>Public Board</h3>
        <span style={{ fontSize: 11, fontWeight: 600, background: COLORS.greenLight, color: COLORS.green, padding: '2px 10px', borderRadius: 12 }}>
          🖥 Screen-share safe — private tasks hidden
        </span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {quadrants.map(q => {
          const qTasks = publicTasks.filter(t => t.quadrant === q.id);
          return (
            <div key={q.id} style={{ background: '#fff', border: `1.5px solid ${COLORS.border}`, borderRadius: 10, padding: 14, minHeight: 100 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, paddingBottom: 8, borderBottom: `1px solid ${COLORS.border}` }}>
                <div style={{ width: 4, height: 14, borderRadius: 2, background: q.accentColor }} />
                <span style={{ fontWeight: 700, fontSize: 13 }}>{q.label}</span>
                <span style={{ fontSize: 11, color: COLORS.textMuted }}>{q.sublabel}</span>
                <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 700, background: q.accentColor + '22', color: q.accentColor, padding: '1px 7px', borderRadius: 10 }}>{qTasks.length}</span>
              </div>
              {qTasks.length === 0
                ? <div style={{ fontSize: 12, color: COLORS.textMuted, textAlign: 'center', padding: '12px 0' }}>—</div>
                : qTasks.map(t => {
                    const owner = getTeamMember(t.ownerId);
                    return (
                      <div key={t.id} style={{
                        padding: '8px 10px', marginBottom: 6, borderRadius: 7,
                        border: `1px solid ${COLORS.border}`, borderLeft: `3px solid ${owner?.color || COLORS.brand}`,
                      }}>
                        <div style={{ fontWeight: 600, fontSize: 13, color: COLORS.textPrimary, marginBottom: 4 }}>{t.title}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                          <Avatar memberId={t.ownerId} size={16} />
                          <span style={{ fontSize: 11, color: COLORS.textSecondary }}>{owner?.name}</span>
                          <ProductChip product={t.product} />
                          {t.dueDate && (
                            <span style={{ fontSize: 11, color: isOverdue(t.dueDate) ? COLORS.red : COLORS.textMuted }}>{formatDate(t.dueDate)}</span>
                          )}
                        </div>
                      </div>
                    );
                  })
              }
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── LINKED TASKS (bottom of meeting) ────────────────────────────────────────
function LinkedTasks({ meetingId, tasks, onNavigateBoard }) {
  const linked = tasks.filter(t => t.meetingId === meetingId && t.status === 'active');
  if (linked.length === 0) return null;
  const quadrantLabel = { 'do-first': 'Do First', 'schedule': 'Schedule', 'delegate': 'Delegate', 'eliminate': 'Eliminate' };
  return (
    <div style={{ padding: '20px 24px', borderTop: `1px solid ${COLORS.border}` }}>
      <h4 style={{ fontWeight: 700, fontSize: 13, color: COLORS.textSecondary, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        Tasks from this meeting
      </h4>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {linked.map(t => {
          const owner = getTeamMember(t.ownerId);
          return (
            <div key={t.id} onClick={() => onNavigateBoard && onNavigateBoard(t.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '6px 12px', borderRadius: 8, cursor: 'pointer',
                background: '#fff', border: `1px solid ${COLORS.border}`,
                borderLeft: `3px solid ${owner?.color || COLORS.brand}`,
                fontSize: 12,
              }}>
              <Avatar memberId={t.ownerId} size={20} />
              <span style={{ fontWeight: 600 }}>{t.title}</span>
              <span style={{ color: COLORS.textMuted }}>·</span>
              <span style={{ color: COLORS.textMuted }}>{quadrantLabel[t.quadrant]}</span>
              {t.isPrivate && <span>🔒</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── MAIN WEEKLY MEETING ──────────────────────────────────────────────────────
function WeeklyMeeting({ currentUser, meetings, setMeetings, updates, setUpdates, needs, setNeeds, decisions, setDecisions, tasks, onNavigateBoard }) {
  const [selectedId, setSelectedId] = React.useState(meetings[0]?.id || null);
  const [activeTab, setActiveTab] = React.useState('updates');
  const [showNewForm, setShowNewForm] = React.useState(false);

  // When meetings load from Supabase the IDs change — reselect the first meeting
  // if the current selectedId no longer exists in the list
  React.useEffect(() => {
    if (meetings.length === 0) return;
    if (!selectedId || !meetings.find(m => m.id === selectedId)) {
      setSelectedId(meetings[0].id);
    }
  }, [meetings]);

  const meeting = meetings.find(m => m.id === selectedId);

  function addMeeting(data) {
    setMeetings(prev => [data, ...prev]);
    setSelectedId(data.id);
    setShowNewForm(false);
  }

  function markComplete() {
    setMeetings(prev => {
      const updated = prev.map(m => m.id === selectedId ? { ...m, status: 'Complete' } : m);
      const changed = updated.find(m => m.id === selectedId);
      if (DB.isConfigured() && changed) DB.updateMeeting(changed).catch(console.error);
      return updated;
    });
  }

  function markActive() {
    setMeetings(prev => {
      const updated = prev.map(m => m.id === selectedId ? { ...m, status: 'Active' } : m);
      const changed = updated.find(m => m.id === selectedId);
      if (DB.isConfigured() && changed) DB.updateMeeting(changed).catch(console.error);
      return updated;
    });
  }

  function deleteMeeting() {
    if (!window.confirm(`Delete "${meeting.label}"? This cannot be undone.`)) return;
    setMeetings(prev => prev.filter(m => m.id !== selectedId));
    if (DB.isConfigured()) DB.deleteMeeting(selectedId).catch(console.error);
    const remaining = meetings.filter(m => m.id !== selectedId);
    setSelectedId(remaining[0]?.id || null);
  }

  const tabs = ['kpis', 'updates', 'needs', 'decisions', 'public-board'];
  const tabLabels = { kpis: 'KPIs', updates: 'Updates', needs: 'Needs', decisions: 'Decisions', 'public-board': '🖥 Public Board' };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Left panel — meeting list */}
      <div style={{ width: 240, flexShrink: 0, borderRight: `1px solid ${COLORS.border}`, display: 'flex', flexDirection: 'column', background: '#fff', overflow: 'hidden' }}>
        <div style={{ padding: '14px 16px', borderBottom: `1px solid ${COLORS.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 700, fontSize: 14 }}>Meetings</span>
          <Btn size="sm" onClick={() => setShowNewForm(v => !v)}>+ New</Btn>
        </div>
        {showNewForm && <NewMeetingForm onSave={addMeeting} onCancel={() => setShowNewForm(false)} />}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {meetings.map(m => (
            <MeetingListItem key={m.id} meeting={m} selected={m.id === selectedId} onClick={() => setSelectedId(m.id)} />
          ))}
        </div>
      </div>

      {/* Right panel — meeting detail */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: COLORS.bg }}>
        {!meeting ? (
          <EmptyState icon="📅" text="Select or create a meeting to get started." />
        ) : (
          <>
            {/* Header */}
            <div style={{ background: '#fff', borderBottom: `1px solid ${COLORS.border}`, padding: '14px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontWeight: 800, fontSize: 18, color: COLORS.textPrimary }}>{meeting.label}</span>
                      <StatusBadge status={meeting.status} />
                    </div>
                    <div style={{ fontSize: 13, color: COLORS.textSecondary, marginTop: 2 }}>{meeting.dateRange}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 16, borderLeft: `1px solid ${COLORS.border}` }}>
                    <span style={{ fontSize: 12, color: COLORS.textMuted }}>Chairman</span>
                    <Avatar memberId={meeting.chairmanId} size={26} />
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{getTeamMember(meeting.chairmanId)?.name}</span>
                  </div>
                  {meeting.targetDuration && (
                    <span style={{ fontSize: 12, color: COLORS.textMuted }}>Target {meeting.targetDuration}min</span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {meeting.status === 'Active' && (
                    <Btn variant="primary" size="sm" onClick={markComplete}>✓ Mark Complete</Btn>
                  )}
                  {meeting.status === 'Draft' && (
                    <Btn variant="primary" size="sm" onClick={markActive}>▶ Start Meeting</Btn>
                  )}
                  {currentUser.id === 'hossam' && (
                    <Btn variant="danger" size="sm" onClick={deleteMeeting}>🗑</Btn>
                  )}
                </div>
              </div>

              {/* Tabs */}
              <div style={{ display: 'flex', gap: 0, marginTop: 14, borderBottom: `1px solid ${COLORS.border}`, marginBottom: -1 }}>
                {tabs.map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)}
                    style={{
                      padding: '8px 16px', border: 'none', background: 'none', cursor: 'pointer',
                      fontSize: 14, fontWeight: activeTab === tab ? 700 : 500,
                      color: activeTab === tab ? COLORS.brand : COLORS.textSecondary,
                      borderBottom: activeTab === tab ? `2px solid ${COLORS.brand}` : '2px solid transparent',
                      transition: 'all .15s',
                    }}>
                    {tabLabels[tab]}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab content */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {activeTab === 'kpis'         && <KPIsTab />}
              {activeTab === 'updates'      && <UpdatesTab meetingId={meeting.id} currentUser={currentUser} updates={updates} setUpdates={setUpdates} />}
              {activeTab === 'needs'        && <NeedsTab meetingId={meeting.id} currentUser={currentUser} needs={needs} setNeeds={setNeeds} />}
              {activeTab === 'decisions'    && <DecisionsTab meetingId={meeting.id} currentUser={currentUser} decisions={decisions} setDecisions={setDecisions} />}
              {activeTab === 'public-board' && <PublicBoardTab meetingId={meeting.id} tasks={tasks} />}
              {activeTab !== 'public-board' && <LinkedTasks meetingId={meeting.id} tasks={tasks} onNavigateBoard={onNavigateBoard} />}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

window.WeeklyMeeting = WeeklyMeeting;
