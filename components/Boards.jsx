
// ─── TASK DETAIL SIDE PANEL ───────────────────────────────────────────────────
function TaskPanel({ task, currentUser, onSave, onClose, onComplete, onDelete, meetings, creating = false }) {
  const initTask = task || {
    id: null, title: '', description: '', ownerId: currentUser.id,
    product: 'Group', quadrant: 'do-first', dueDate: '', isPrivate: false,
    status: 'active', meetingId: null, createdBy: currentUser.id,
    createdAt: new Date().toISOString(), completedAt: null,
  };
  const [draft, setDraft] = React.useState({ ...initTask });
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => { setTimeout(() => setVisible(true), 10); }, []);

  const canEdit = creating || draft.createdBy === currentUser.id || draft.ownerId === currentUser.id;
  const quadrantOptions = [
    { value: 'do-first',  label: 'Do First — Urgent + Important' },
    { value: 'schedule',  label: 'Schedule — Not Urgent + Important' },
    { value: 'delegate',  label: 'Delegate — Urgent + Not Important' },
    { value: 'eliminate', label: 'Eliminate — Not Urgent + Not Important' },
  ];
  const meetingLabel = draft.meetingId && meetings
    ? meetings.find(m => m.id === draft.meetingId)?.label
    : null;

  function handleSave() {
    if (!draft.title.trim()) return;
    onSave(draft);
    onClose();
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      display: 'flex', justifyContent: 'flex-end',
    }}>
      {/* Backdrop */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.25)' }} onClick={onClose} />

      {/* Panel */}
      <div style={{
        position: 'relative', width: 360, background: '#fff',
        boxShadow: '-4px 0 24px rgba(0,0,0,0.12)',
        display: 'flex', flexDirection: 'column',
        transform: visible ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform .25s ease',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{ padding: '14px 16px', borderBottom: `1px solid ${COLORS.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 700, fontSize: 14 }}>{creating ? 'New Task' : 'Task Detail'}</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: COLORS.textMuted, lineHeight: 1 }}>×</button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Title */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.textSecondary, display: 'block', marginBottom: 4 }}>Title *</label>
            {canEdit
              ? <input value={draft.title} onChange={e => setDraft(p => ({ ...p, title: e.target.value }))}
                  placeholder="Task title…"
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 7, border: `1px solid ${COLORS.border}`, fontSize: 14, fontWeight: 600, outline: 'none' }} />
              : <p style={{ fontSize: 14, fontWeight: 600 }}>{draft.title}</p>
            }
          </div>

          {/* Description */}
          {canEdit
            ? <Textarea label="Description" value={draft.description} onChange={v => setDraft(p => ({ ...p, description: v }))} placeholder="Optional notes…" rows={3} />
            : draft.description && <p style={{ fontSize: 13, color: COLORS.textSecondary, lineHeight: 1.5 }}>{draft.description}</p>
          }

          {/* Owner */}
          {canEdit
            ? <Select label="Owner" value={draft.ownerId} onChange={v => setDraft(p => ({ ...p, ownerId: v }))}
                options={TEAM.map(m => ({ value: m.id, label: `${m.name} — ${m.role}` }))} />
            : <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: COLORS.textSecondary }}>Owner</span>
                <Avatar memberId={draft.ownerId} size={22} />
                <span style={{ fontSize: 13 }}>{getTeamMember(draft.ownerId)?.name}</span>
              </div>
          }

          {/* Product */}
          {canEdit
            ? <Select label="Product" value={draft.product} onChange={v => setDraft(p => ({ ...p, product: v }))}
                options={PRODUCTS.map(p => ({ value: p, label: p }))} />
            : <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: COLORS.textSecondary }}>Product</span>
                <ProductChip product={draft.product} />
              </div>
          }

          {/* Quadrant */}
          {canEdit
            ? <Select label="Quadrant" value={draft.quadrant} onChange={v => setDraft(p => ({ ...p, quadrant: v }))} options={quadrantOptions} />
            : <div style={{ fontSize: 13, color: COLORS.textSecondary }}>
                <span style={{ fontWeight: 600 }}>Quadrant: </span>
                {quadrantOptions.find(q => q.value === draft.quadrant)?.label}
              </div>
          }

          {/* Due date */}
          {canEdit
            ? <Input label="Due date" type="date" value={draft.dueDate || ''} onChange={v => setDraft(p => ({ ...p, dueDate: v }))} />
            : draft.dueDate && <div style={{ fontSize: 13, color: COLORS.textSecondary }}><span style={{ fontWeight: 600 }}>Due: </span>{formatDate(draft.dueDate)}</div>
          }

          {/* Privacy toggle */}
          {canEdit && (
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.textSecondary, display: 'block', marginBottom: 6 }}>Visibility</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {[{ val: false, icon: '🌐', label: 'Visible to all' }, { val: true, icon: '🔒', label: 'Only me' }].map(opt => (
                  <div key={String(opt.val)} onClick={() => setDraft(p => ({ ...p, isPrivate: opt.val }))}
                    style={{
                      flex: 1, padding: '8px 10px', borderRadius: 8, cursor: 'pointer', textAlign: 'center',
                      border: `1.5px solid ${draft.isPrivate === opt.val ? COLORS.brand : COLORS.border}`,
                      background: draft.isPrivate === opt.val ? COLORS.brandLight : '#fff',
                      fontSize: 12, fontWeight: 600,
                      color: draft.isPrivate === opt.val ? COLORS.brand : COLORS.textSecondary,
                      transition: 'all .15s',
                    }}>
                    {opt.icon} {opt.label}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div style={{ padding: '10px 0', borderTop: `1px solid ${COLORS.border}`, fontSize: 11, color: COLORS.textMuted, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {meetingLabel && <span>Created in {meetingLabel}</span>}
            <span>Created by {getTeamMember(draft.createdBy)?.name} · {formatRelativeTime(draft.createdAt)}</span>
            {draft.completedAt && <span>Completed {formatRelativeTime(draft.completedAt)}</span>}
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: 16, borderTop: `1px solid ${COLORS.border}`, display: 'flex', gap: 8 }}>
          {canEdit && (
            <Btn variant="primary" style={{ flex: 1 }} onClick={handleSave}>
              {creating ? 'Create Task' : 'Save'}
            </Btn>
          )}
          {!creating && task?.status === 'active' && (
            <Btn variant="success" onClick={() => { onComplete(task.id); onClose(); }}>✓ Complete</Btn>
          )}
          {!creating && canEdit && (
            <Btn variant="danger" onClick={() => { onDelete(task.id); onClose(); }}>🗑</Btn>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── TASK CARD ────────────────────────────────────────────────────────────────
function TaskCard({ task, currentUser, onClick, isDragging, onDragStart, onDragEnd }) {
  const owner = getTeamMember(task.ownerId);
  const isPrivate = task.isPrivate;
  const isOwn = task.ownerId === currentUser.id;
  const canSee = !isPrivate || isOwn;
  const [hov, setHov] = React.useState(false);

  return (
    <div
      draggable
      onDragStart={e => { e.dataTransfer.setData('taskId', task.id); onDragStart && onDragStart(); }}
      onDragEnd={() => onDragEnd && onDragEnd()}
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: '#fff',
        border: `1px solid ${COLORS.border}`,
        borderLeft: `4px solid ${owner?.color || COLORS.brand}`,
        borderRadius: 8, padding: '10px 12px',
        cursor: 'pointer', marginBottom: 8,
        opacity: isDragging ? 0.5 : 1,
        boxShadow: hov ? '0 2px 8px rgba(0,0,0,0.10)' : '0 1px 3px rgba(0,0,0,0.04)',
        transition: 'box-shadow .15s, opacity .15s',
        userSelect: 'none',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 6 }}>
        <span style={{
          fontSize: 13, fontWeight: 600, color: COLORS.textPrimary, lineHeight: 1.4,
          textDecoration: task.status === 'complete' ? 'line-through' : 'none',
          opacity: task.status === 'complete' ? 0.6 : 1,
        }}>
          {task.title}
        </span>
        <span style={{
          fontSize: 10, fontWeight: 700, flexShrink: 0,
          padding: '2px 6px', borderRadius: 4,
          background: isPrivate ? '#FEF2F2' : '#EFF6FF',
          color: isPrivate ? COLORS.red : COLORS.blue,
        }}>
          {isPrivate ? '🔒 Private' : '🌐 Public'}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
        <Avatar memberId={task.ownerId} size={18} />
        <span style={{ fontSize: 11, color: COLORS.textSecondary }}>{owner?.name}</span>
        <ProductChip product={task.product} />
        {task.dueDate && (
          <span style={{ fontSize: 11, color: isOverdue(task.dueDate) && task.status !== 'complete' ? COLORS.red : COLORS.textMuted }}>
            {formatDate(task.dueDate)}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── QUADRANT ────────────────────────────────────────────────────────────────
function Quadrant({ id, label, sublabel, accentColor, tasks, currentUser, onDrop, onTaskClick, showCompleted, draggingId }) {
  const [over, setOver] = React.useState(false);
  const [dragId, setDragId] = React.useState(null);

  const visible = tasks.filter(t => showCompleted || t.status === 'active');

  return (
    <div
      onDragOver={e => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={e => {
        e.preventDefault();
        const taskId = e.dataTransfer.getData('taskId');
        if (taskId) onDrop(taskId, id);
        setOver(false);
      }}
      style={{
        flex: 1, minHeight: 0,
        background: over ? '#EFF6FF' : COLORS.bg,
        border: `1.5px solid ${over ? COLORS.blue : COLORS.border}`,
        borderRadius: 10, padding: '12px',
        display: 'flex', flexDirection: 'column',
        transition: 'background .15s, border-color .15s',
        overflow: 'hidden',
      }}
    >
      {/* Quadrant header */}
      <div style={{ marginBottom: 12, paddingBottom: 8, borderBottom: `1px solid ${COLORS.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 4, height: 16, borderRadius: 2, background: accentColor }} />
          <span style={{ fontWeight: 700, fontSize: 13, color: COLORS.textPrimary }}>{label}</span>
          <span style={{
            marginLeft: 'auto', fontSize: 11, fontWeight: 700,
            background: accentColor + '22', color: accentColor,
            padding: '1px 7px', borderRadius: 10,
          }}>{visible.length}</span>
        </div>
        <div style={{ fontSize: 11, color: COLORS.textMuted, marginLeft: 12, marginTop: 2 }}>{sublabel}</div>
      </div>

      {/* Cards */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {visible.length === 0
          ? <div style={{ fontSize: 12, color: COLORS.textMuted, textAlign: 'center', padding: '20px 8px', lineHeight: 1.5 }}>
              No tasks here — drag one over or add a new task.
            </div>
          : visible.map(t => (
            <TaskCard
              key={t.id} task={t} currentUser={currentUser}
              isDragging={draggingId === t.id}
              onDragStart={() => setDragId(t.id)}
              onDragEnd={() => setDragId(null)}
              onClick={() => onTaskClick(t)}
            />
          ))
        }
      </div>
    </div>
  );
}

// ─── GROUP BOARD ──────────────────────────────────────────────────────────────
function GroupBoard({ currentUser, tasks, setTasks, meetings, onNavigate }) {
  const [boardTab, setBoardTab] = React.useState('board'); // 'board' | 'history'
  const [ownerFilter, setOwnerFilter] = React.useState([]);
  const [productFilter, setProductFilter] = React.useState('All');
  const [showCompleted, setShowCompleted] = React.useState(false);
  const [selectedTask, setSelectedTask] = React.useState(null);
  const [showPanel, setShowPanel] = React.useState(false);
  const [creating, setCreating] = React.useState(false);
  const [draggingId, setDraggingId] = React.useState(null);

  // Filter tasks visible on group board (no private tasks from others)
  function visibleTask(t) {
    if (t.isPrivate && t.ownerId !== currentUser.id) return false;
    if (ownerFilter.length > 0 && !ownerFilter.includes(t.ownerId)) return false;
    if (productFilter !== 'All' && t.product !== productFilter) return false;
    return true;
  }

  const activeTasks   = tasks.filter(t => t.status === 'active'   && visibleTask(t));
  const completedTasks= tasks.filter(t => t.status === 'complete' && visibleTask(t));

  function drop(taskId, quadrant) {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, quadrant } : t));
  }

  function openTask(t) { setSelectedTask(t); setCreating(false); setShowPanel(true); }
  function newTask()   { setSelectedTask(null); setCreating(true); setShowPanel(true); }

  function saveTask(draft) {
    if (creating) {
      setTasks(prev => [...prev, { ...draft, id: generateId('t'), createdAt: new Date().toISOString(), status: 'active', completedAt: null }]);
    } else {
      setTasks(prev => prev.map(t => t.id === draft.id ? { ...t, ...draft } : t));
    }
  }

  function completeTask(id) {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: 'complete', completedAt: new Date().toISOString() } : t));
  }

  function deleteTask(id) {
    setTasks(prev => prev.filter(t => t.id !== id));
    if (DB.isConfigured()) DB.deleteTask(id).catch(console.error);
  }

  function restoreTask(id) {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: 'active', completedAt: null } : t));
  }

  const quadrants = [
    { id: 'do-first',  label: 'Do First',  sublabel: 'Urgent + Important',     accentColor: COLORS.red   },
    { id: 'schedule',  label: 'Schedule',  sublabel: 'Not Urgent + Important',  accentColor: COLORS.blue  },
    { id: 'delegate',  label: 'Delegate',  sublabel: 'Urgent + Not Important',  accentColor: COLORS.amber },
    { id: 'eliminate', label: 'Eliminate', sublabel: 'Not Urgent + Not Important', accentColor: COLORS.gray },
  ];

  function toggleOwner(id) {
    setOwnerFilter(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: COLORS.bg }}>
      {/* Toolbar */}
      <div style={{ background: '#fff', borderBottom: `1px solid ${COLORS.border}`, padding: '12px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Board / History tabs */}
            {['board', 'history'].map(t => (
              <button key={t} onClick={() => setBoardTab(t)} style={{
                padding: '6px 14px', borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
                background: boardTab === t ? COLORS.brand : 'transparent',
                color: boardTab === t ? '#fff' : COLORS.textSecondary,
                transition: 'all .15s',
              }}>
                {t === 'board' ? 'Board' : 'History'}
              </button>
            ))}
            <span style={{ color: COLORS.border }}>|</span>

            {/* Owner filter avatars */}
            <div style={{ display: 'flex', gap: 4 }}>
              {TEAM.map(m => (
                <div key={m.id} onClick={() => toggleOwner(m.id)} title={m.name}
                  style={{
                    width: 30, height: 30, borderRadius: '50%', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 10, fontWeight: 700, letterSpacing: '-0.5px',
                    background: ownerFilter.includes(m.id) ? m.color + '25' : '#F3F4F6',
                    color: ownerFilter.includes(m.id) ? m.color : COLORS.textMuted,
                    border: ownerFilter.includes(m.id) ? `2px solid ${m.color}` : '2px solid transparent',
                    transition: 'all .15s',
                    opacity: ownerFilter.length > 0 && !ownerFilter.includes(m.id) ? 0.4 : 1,
                  }}>
                  {m.initials}
                </div>
              ))}
            </div>

            {/* Product filter */}
            <div style={{ display: 'flex', gap: 4 }}>
              {['All', ...PRODUCTS].map(p => (
                <button key={p} onClick={() => setProductFilter(p)} style={{
                  padding: '4px 10px', borderRadius: 14, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600,
                  background: productFilter === p ? COLORS.textPrimary : '#F3F4F6',
                  color: productFilter === p ? '#fff' : COLORS.textSecondary,
                  transition: 'all .15s',
                }}>
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {boardTab === 'board' && (
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: COLORS.textSecondary, cursor: 'pointer' }}>
                <input type="checkbox" checked={showCompleted} onChange={e => setShowCompleted(e.target.checked)} />
                Show completed
              </label>
            )}
            {boardTab === 'board' && (
              <Btn variant="primary" size="sm" onClick={newTask}>+ Add Task</Btn>
            )}
            {boardTab === 'history' && (
              <span style={{ fontSize: 12, color: COLORS.textMuted }}>{completedTasks.length} completed tasks</span>
            )}
          </div>
        </div>
      </div>

      {/* Board */}
      {boardTab === 'board' && (
        <div style={{ flex: 1, padding: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: 12, overflow: 'hidden' }}>
          {quadrants.map(q => (
            <Quadrant
              key={q.id} {...q}
              tasks={activeTasks.filter(t => t.quadrant === q.id).concat(
                showCompleted ? completedTasks.filter(t => t.quadrant === q.id) : []
              )}
              currentUser={currentUser}
              onDrop={drop}
              onTaskClick={openTask}
              showCompleted={showCompleted}
              draggingId={draggingId}
            />
          ))}
        </div>
      )}

      {/* History */}
      {boardTab === 'history' && (
        <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
          <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Completed Tasks</h3>
          {completedTasks.length === 0
            ? <EmptyState icon="✅" text="No completed tasks yet." />
            : completedTasks.map(t => (
              <Card key={t.id} style={{ marginBottom: 8, opacity: 0.75 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 13, fontWeight: 600, textDecoration: 'line-through', color: COLORS.textSecondary }}>{t.title}</span>
                      <Avatar memberId={t.ownerId} size={20} />
                      <ProductChip product={t.product} />
                      <span style={{ fontSize: 11, color: COLORS.textMuted }}>Completed {formatRelativeTime(t.completedAt)}</span>
                    </div>
                  </div>
                  <Btn size="sm" onClick={() => restoreTask(t.id)}>↩ Restore</Btn>
                </div>
              </Card>
            ))
          }
        </div>
      )}

      {/* Task Panel */}
      {showPanel && (
        <TaskPanel
          task={selectedTask}
          currentUser={currentUser}
          creating={creating}
          meetings={meetings}
          onSave={saveTask}
          onClose={() => setShowPanel(false)}
          onComplete={completeTask}
          onDelete={deleteTask}
        />
      )}
    </div>
  );
}

// ─── MY BOARD ─────────────────────────────────────────────────────────────────
function MyBoard({ currentUser, tasks, setTasks, needs, meetings }) {
  const [visibility, setVisibility] = React.useState('all'); // 'all' | 'public'
  const [selectedTask, setSelectedTask] = React.useState(null);
  const [showPanel, setShowPanel] = React.useState(false);
  const [creating, setCreating] = React.useState(false);
  const [draggingId, setDraggingId] = React.useState(null);

  const myTasks = tasks.filter(t => t.ownerId === currentUser.id && t.status === 'active');
  const filtered = myTasks.filter(t => visibility === 'all' || !t.isPrivate);

  // Requests
  const assignedToMe = needs.filter(n => n.toId === currentUser.id);
  const assignedByMe = needs.filter(n => n.fromId === currentUser.id);

  function drop(taskId, quadrant) {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, quadrant } : t));
  }

  function openTask(t) { setSelectedTask(t); setCreating(false); setShowPanel(true); }
  function newTask()   { setSelectedTask(null); setCreating(true); setShowPanel(true); }

  function saveTask(draft) {
    if (creating) {
      setTasks(prev => [...prev, { ...draft, id: generateId('t'), createdAt: new Date().toISOString(), status: 'active', completedAt: null }]);
    } else {
      setTasks(prev => prev.map(t => t.id === draft.id ? { ...t, ...draft } : t));
    }
  }

  function completeTask(id) {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: 'complete', completedAt: new Date().toISOString() } : t));
  }

  function deleteTask(id) {
    setTasks(prev => prev.filter(t => t.id !== id));
    if (DB.isConfigured()) DB.deleteTask(id).catch(console.error);
  }

  function togglePrivacy(taskId) {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, isPrivate: !t.isPrivate } : t));
  }

  const quadrants = [
    { id: 'do-first',  label: 'Do First',  sublabel: 'Urgent + Important',        accentColor: COLORS.red   },
    { id: 'schedule',  label: 'Schedule',  sublabel: 'Not Urgent + Important',     accentColor: COLORS.blue  },
    { id: 'delegate',  label: 'Delegate',  sublabel: 'Urgent + Not Important',     accentColor: COLORS.amber },
    { id: 'eliminate', label: 'Eliminate', sublabel: 'Not Urgent + Not Important', accentColor: COLORS.gray  },
  ];

  const owner = getTeamMember(currentUser.id);

  return (
    <div style={{ height: '100vh', display: 'flex', overflow: 'hidden', background: COLORS.bg }}>
      {/* Main board area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Toolbar */}
        <div style={{ background: '#fff', borderBottom: `1px solid ${COLORS.border}`, padding: '12px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Avatar memberId={currentUser.id} size={28} />
                <span style={{ fontWeight: 800, fontSize: 16, color: owner?.color }}>{currentUser.name}'s Board</span>
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                {[{ v: 'all', l: 'All Tasks' }, { v: 'public', l: 'Public Only' }].map(opt => (
                  <button key={opt.v} onClick={() => setVisibility(opt.v)} style={{
                    padding: '5px 12px', borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600,
                    background: visibility === opt.v ? COLORS.textPrimary : '#F3F4F6',
                    color: visibility === opt.v ? '#fff' : COLORS.textSecondary,
                    transition: 'all .15s',
                  }}>
                    {opt.l}
                  </button>
                ))}
              </div>
            </div>
            <Btn variant="primary" size="sm" onClick={newTask}>+ Add Task</Btn>
          </div>
        </div>

        {/* Grid */}
        <div style={{ flex: 1, padding: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: 12, overflow: 'hidden' }}>
          {quadrants.map(q => {
            const qTasks = filtered.filter(t => t.quadrant === q.id);
            return (
              <div
                key={q.id}
                onDragOver={e => e.preventDefault()}
                onDrop={e => { e.preventDefault(); const id = e.dataTransfer.getData('taskId'); if (id) drop(id, q.id); }}
                style={{ flex: 1, background: COLORS.bg, border: `1.5px solid ${COLORS.border}`, borderRadius: 10, padding: 12, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
              >
                <div style={{ marginBottom: 10, paddingBottom: 8, borderBottom: `1px solid ${COLORS.border}`, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 4, height: 16, borderRadius: 2, background: q.accentColor }} />
                  <span style={{ fontWeight: 700, fontSize: 13 }}>{q.label}</span>
                  <span style={{ fontSize: 11, color: COLORS.textMuted }}>{q.sublabel}</span>
                  <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 700, background: q.accentColor + '22', color: q.accentColor, padding: '1px 7px', borderRadius: 10 }}>
                    {qTasks.length}
                  </span>
                </div>
                <div style={{ flex: 1, overflowY: 'auto' }}>
                  {qTasks.length === 0
                    ? <div style={{ fontSize: 12, color: COLORS.textMuted, textAlign: 'center', padding: '16px 4px' }}>Empty</div>
                    : qTasks.map(t => (
                      <div key={t.id} style={{ position: 'relative' }}>
                        <TaskCard
                          task={t} currentUser={currentUser}
                          isDragging={draggingId === t.id}
                          onDragStart={() => setDraggingId(t.id)}
                          onDragEnd={() => setDraggingId(null)}
                          onClick={() => openTask(t)}
                        />
                        {/* Privacy toggle */}
                        <button
                          onClick={e => { e.stopPropagation(); togglePrivacy(t.id); }}
                          title={t.isPrivate ? 'Click to make public' : 'Click to make private'}
                          style={{
                            position: 'absolute', top: 6, right: 6,
                            background: 'rgba(255,255,255,0.95)', border: `1px solid ${COLORS.border}`,
                            borderRadius: 5, cursor: 'pointer', fontSize: 10, padding: '2px 6px',
                            color: t.isPrivate ? COLORS.red : COLORS.blue, fontWeight: 700,
                          }}>
                          {t.isPrivate ? '🔒→🌐' : '🌐→🔒'}
                        </button>
                      </div>
                    ))
                  }
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Requests panel */}
      <div style={{ width: 220, flexShrink: 0, borderLeft: `1px solid ${COLORS.border}`, background: '#fff', overflowY: 'auto', padding: 16 }}>
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 16 }}>Requests</div>

        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.textMuted, letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: 10 }}>
            Assigned to me
          </div>
          {assignedToMe.length === 0
            ? <div style={{ fontSize: 12, color: COLORS.textMuted }}>None</div>
            : assignedToMe.map(n => {
              const from = getTeamMember(n.fromId);
              return (
                <div key={n.id} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: `1px solid ${COLORS.borderLight}` }}>
                  <div style={{ fontSize: 11, color: from?.color, fontWeight: 700, marginBottom: 4 }}>from {from?.name}</div>
                  <div style={{ fontSize: 12, color: COLORS.textPrimary, lineHeight: 1.4, marginBottom: 4 }}>{n.description}</div>
                  <StatusBadge status={n.status} />
                </div>
              );
            })
          }
        </div>

        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.textMuted, letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: 10 }}>
            Assigned by me
          </div>
          {assignedByMe.length === 0
            ? <div style={{ fontSize: 12, color: COLORS.textMuted }}>None</div>
            : assignedByMe.map(n => {
              const to = getTeamMember(n.toId);
              return (
                <div key={n.id} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: `1px solid ${COLORS.borderLight}` }}>
                  <div style={{ fontSize: 11, color: to?.color, fontWeight: 700, marginBottom: 4 }}>→ {to?.name}</div>
                  <div style={{ fontSize: 12, color: COLORS.textPrimary, lineHeight: 1.4, marginBottom: 4 }}>{n.description}</div>
                  <StatusBadge status={n.status} />
                </div>
              );
            })
          }
        </div>
      </div>

      {/* Task Panel */}
      {showPanel && (
        <TaskPanel
          task={selectedTask} currentUser={currentUser}
          creating={creating} meetings={meetings}
          onSave={saveTask} onClose={() => setShowPanel(false)}
          onComplete={completeTask} onDelete={deleteTask}
        />
      )}
    </div>
  );
}

window.GroupBoard = GroupBoard;
window.MyBoard = MyBoard;
