
// ─── CLIENT ───────────────────────────────────────────────────────────────────
let _sb = null;

function isConfigured() { return !!_sb; }

function init(url, key) {
  _sb = window.supabase.createClient(url, key);
  return _sb;
}

// Auto-initialise from config.js (runs immediately when this file loads)
;(function autoInit() {
  const cfg = window.BGH_CONFIG;
  if (cfg && cfg.supabaseUrl && cfg.supabaseUrl !== 'YOUR_SUPABASE_URL') {
    init(cfg.supabaseUrl, cfg.supabaseKey);
  }
})();

// ─── SNAKE ↔ CAMEL CONVERTERS ────────────────────────────────────────────────
function meetingFromDB(r) {
  return { id: r.id, label: r.label, dateRange: r.date_range, startDate: r.start_date,
    endDate: r.end_date, chairmanId: r.chairman_id, status: r.status,
    targetDuration: r.target_duration, actualDuration: r.actual_duration, createdAt: r.created_at };
}
function meetingToDB(m) {
  return { id: m.id, label: m.label, date_range: m.dateRange, start_date: m.startDate || null,
    end_date: m.endDate || null, chairman_id: m.chairmanId, status: m.status,
    target_duration: m.targetDuration || null, actual_duration: m.actualDuration || null,
    created_at: m.createdAt };
}

function taskFromDB(r) {
  return { id: r.id, title: r.title, description: r.description || '', ownerId: r.owner_id,
    product: r.product, quadrant: r.quadrant, dueDate: r.due_date || null,
    isPrivate: r.is_private, status: r.status, meetingId: r.meeting_id,
    createdBy: r.created_by, createdAt: r.created_at, completedAt: r.completed_at || null };
}
function taskToDB(t) {
  return { id: t.id, title: t.title, description: t.description || '', owner_id: t.ownerId,
    product: t.product, quadrant: t.quadrant, due_date: t.dueDate || null,
    is_private: t.isPrivate || false, status: t.status, meeting_id: t.meetingId || null,
    created_by: t.createdBy, created_at: t.createdAt, completed_at: t.completedAt || null };
}

function needFromDB(r) {
  return { id: r.id, fromId: r.from_id, toId: r.to_id, description: r.description,
    status: r.status, dueDate: r.due_date || null, product: r.product,
    meetingId: r.meeting_id, createdAt: r.created_at };
}
function needToDB(n) {
  return { id: n.id, from_id: n.fromId, to_id: n.toId, description: n.description,
    status: n.status, due_date: n.dueDate || null, product: n.product,
    meeting_id: n.meetingId || null, created_at: n.createdAt };
}

function decisionFromDB(r) {
  return { id: r.id, topic: r.topic, ownerId: r.owner_id, relevantIds: r.relevant_ids || [],
    status: r.status, outcome: r.outcome || '', notes: r.notes || '',
    meetingId: r.meeting_id, createdAt: r.created_at,
    approvedBy: r.approved_by || null, approvedAt: r.approved_at || null };
}
function decisionToDB(d) {
  return { id: d.id, topic: d.topic, owner_id: d.ownerId, relevant_ids: d.relevantIds || [],
    status: d.status, outcome: d.outcome || '', notes: d.notes || '',
    meeting_id: d.meetingId || null, created_at: d.createdAt,
    approved_by: d.approvedBy || null, approved_at: d.approvedAt || null };
}

// updates: nested app object ↔ flat DB rows
function updatesFromDB(rows) {
  const out = {};
  rows.forEach(r => {
    if (!out[r.meeting_id]) out[r.meeting_id] = {};
    out[r.meeting_id][r.user_id] = {
      general: r.general || '', budget: r.budget || '',
      needs: r.needs_text || '', launch: r.launch || '',
      lastEdited: r.last_edited,
    };
  });
  return out;
}
function updatesToRows(updates) {
  const rows = [];
  Object.entries(updates).forEach(([meetingId, byUser]) => {
    Object.entries(byUser).forEach(([userId, data]) => {
      rows.push({
        id: `${meetingId}-${userId}`,
        meeting_id: meetingId, user_id: userId,
        general: data.general || '', budget: data.budget || '',
        needs_text: data.needs || '', launch: data.launch || '',
        last_edited: data.lastEdited || new Date().toISOString(),
      });
    });
  });
  return rows;
}

// ─── FETCH ALL ────────────────────────────────────────────────────────────────
async function fetchAll() {
  const [m, t, n, d, u] = await Promise.all([
    _sb.from('meetings').select('*').order('created_at', { ascending: false }),
    _sb.from('tasks').select('*').order('created_at', { ascending: true }),
    _sb.from('needs').select('*').order('created_at', { ascending: true }),
    _sb.from('decisions').select('*').order('created_at', { ascending: true }),
    _sb.from('updates').select('*'),
  ]);
  if (m.error) throw m.error;
  if (t.error) throw t.error;
  return {
    meetings:  (m.data || []).map(meetingFromDB),
    tasks:     (t.data || []).map(taskFromDB),
    needs:     (n.data || []).map(needFromDB),
    decisions: (d.data || []).map(decisionFromDB),
    updates:   updatesFromDB(u.data || []),
  };
}

// ─── SYNC (full upsert on state change) ──────────────────────────────────────
async function syncMeetings(meetings) {
  const { error } = await _sb.from('meetings').upsert(meetings.map(meetingToDB));
  if (error) console.error('sync meetings:', error);
}
async function syncTasks(tasks) {
  const { error } = await _sb.from('tasks').upsert(tasks.map(taskToDB));
  if (error) console.error('sync tasks:', error);
}
async function syncNeeds(needs) {
  const { error } = await _sb.from('needs').upsert(needs.map(needToDB));
  if (error) console.error('sync needs:', error);
}
async function syncDecisions(decisions) {
  const { error } = await _sb.from('decisions').upsert(decisions.map(decisionToDB));
  if (error) console.error('sync decisions:', error);
}
async function syncUpdates(updates) {
  const rows = updatesToRows(updates);
  if (rows.length === 0) return;
  const { error } = await _sb.from('updates').upsert(rows);
  if (error) console.error('sync updates:', error);
}

// Delete a single record (used on hard-delete)
async function deleteTask(id) {
  await _sb.from('tasks').delete().eq('id', id);
}
async function deleteNeed(id) {
  await _sb.from('needs').delete().eq('id', id);
}
async function deleteDecision(id) {
  await _sb.from('decisions').delete().eq('id', id);
}
async function deleteMeeting(id) {
  await _sb.from('meetings').delete().eq('id', id);
}

// Update a single record immediately (status changes, completions — bypass debounce)
async function updateMeeting(meeting) {
  const { error } = await _sb.from('meetings').upsert([meetingToDB(meeting)]);
  if (error) console.error('update meeting:', error);
}
async function updateNeed(need) {
  const { error } = await _sb.from('needs').upsert([needToDB(need)]);
  if (error) console.error('update need:', error);
}
async function updateDecision(decision) {
  const { error } = await _sb.from('decisions').upsert([decisionToDB(decision)]);
  if (error) console.error('update decision:', error);
}

// Delete everything — used by Setup "Reset Database"
async function clearAll() {
  await Promise.all([
    _sb.from('updates').delete().not('id', 'is', null),
    _sb.from('decisions').delete().not('id', 'is', null),
    _sb.from('needs').delete().not('id', 'is', null),
    _sb.from('tasks').delete().not('id', 'is', null),
    _sb.from('meetings').delete().not('id', 'is', null),
  ]);
}

// ─── REALTIME ────────────────────────────────────────────────────────────────
function subscribe(handlers) {
  // handlers: { onTask, onNeed, onDecision, onMeeting, onUpdate }
  return _sb
    .channel('bgh-realtime')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, payload => {
      handlers.onTask && handlers.onTask(payload);
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'needs' }, payload => {
      handlers.onNeed && handlers.onNeed(payload);
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'decisions' }, payload => {
      handlers.onDecision && handlers.onDecision(payload);
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'meetings' }, payload => {
      handlers.onMeeting && handlers.onMeeting(payload);
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'updates' }, payload => {
      handlers.onUpdate && handlers.onUpdate(payload);
    })
    .subscribe();
}

// ─── BULK IMPORT (for historical meetings) ────────────────────────────────────
async function importMeetingBundle(bundle) {
  // bundle = { meeting, updates, tasks, needs, decisions }
  const meeting = {
    ...bundle.meeting,
    id: bundle.meeting.id || generateId('week'),
    createdAt: bundle.meeting.createdAt || bundle.meeting.startDate + 'T08:00:00Z',
  };

  // Insert meeting first (tasks/needs/decisions reference it)
  const { error: me } = await _sb.from('meetings').upsert([meetingToDB(meeting)]);
  if (me) throw me;

  const mid = meeting.id;

  // Tasks
  if (bundle.tasks && bundle.tasks.length > 0) {
    const rows = bundle.tasks.map(t => taskToDB({
      ...t, id: t.id || generateId('t'), meetingId: mid,
      createdBy: t.createdBy || t.ownerId,
      createdAt: t.createdAt || meeting.createdAt,
      completedAt: t.status === 'complete' ? (t.completedAt || meeting.createdAt) : null,
    }));
    const { error } = await _sb.from('tasks').upsert(rows);
    if (error) throw error;
  }

  // Needs
  if (bundle.needs && bundle.needs.length > 0) {
    const rows = bundle.needs.map(n => needToDB({
      ...n, id: n.id || generateId('n'), meetingId: mid,
      createdAt: n.createdAt || meeting.createdAt,
    }));
    const { error } = await _sb.from('needs').upsert(rows);
    if (error) throw error;
  }

  // Decisions
  if (bundle.decisions && bundle.decisions.length > 0) {
    const rows = bundle.decisions.map(d => decisionToDB({
      ...d, id: d.id || generateId('d'), meetingId: mid,
      createdAt: d.createdAt || meeting.createdAt,
    }));
    const { error } = await _sb.from('decisions').upsert(rows);
    if (error) throw error;
  }

  // Updates
  if (bundle.updates) {
    const rows = updatesToRows({ [mid]: bundle.updates });
    if (rows.length > 0) {
      const { error } = await _sb.from('updates').upsert(rows);
      if (error) throw error;
    }
  }

  return meeting;
}

// ─── TEST CONNECTION ──────────────────────────────────────────────────────────
async function testConnection() {
  const { error } = await _sb.from('meetings').select('id').limit(1);
  if (error) throw error;
  return true;
}

// ─── AUTH ─────────────────────────────────────────────────────────────────────
function signIn(email, password)      { return _sb.auth.signInWithPassword({ email, password }); }
function signUp(email, password)      { return _sb.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin + window.location.pathname } }); }
function signOut()                    { return _sb.auth.signOut(); }
function getSession()                 { return _sb.auth.getSession(); }
function onAuthChange(cb)             { return _sb.auth.onAuthStateChange(cb); }
function resetPassword(email, url)    { return _sb.auth.resetPasswordForEmail(email, { redirectTo: url }); }
function updatePassword(password)     { return _sb.auth.updateUser({ password }); }

// Expose globally
window.DB = {
  isConfigured, init,
  fetchAll,
  syncMeetings, syncTasks, syncNeeds, syncDecisions, syncUpdates,
  deleteTask, deleteNeed, deleteDecision, deleteMeeting, clearAll,
  updateMeeting, updateNeed, updateDecision,
  subscribe,
  importMeetingBundle,
  testConnection,
  // converters exposed for import use
  meetingFromDB, taskFromDB, needFromDB, decisionFromDB, updatesFromDB,
  // auth
  signIn, signUp, signOut, getSession, onAuthChange, resetPassword, updatePassword,
};
