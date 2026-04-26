-- ═══════════════════════════════════════════════════════════════════════════
-- BAIMS GROUP HUB — Supabase Schema
-- Run this entire file in your Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── MEETINGS ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS meetings (
  id              TEXT PRIMARY KEY,
  label           TEXT NOT NULL,
  date_range      TEXT,
  start_date      DATE,
  end_date        DATE,
  chairman_id     TEXT,
  status          TEXT NOT NULL DEFAULT 'Draft', -- Draft | Active | Complete
  target_duration INTEGER,
  actual_duration INTEGER,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── TASKS ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tasks (
  id           TEXT PRIMARY KEY,
  title        TEXT NOT NULL,
  description  TEXT NOT NULL DEFAULT '',
  owner_id     TEXT,
  product      TEXT,
  quadrant     TEXT NOT NULL DEFAULT 'do-first', -- do-first | schedule | delegate | eliminate
  due_date     DATE,
  is_private   BOOLEAN NOT NULL DEFAULT FALSE,
  status       TEXT NOT NULL DEFAULT 'active',   -- active | complete
  meeting_id   TEXT REFERENCES meetings(id) ON DELETE SET NULL,
  created_by   TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- ─── NEEDS ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS needs (
  id          TEXT PRIMARY KEY,
  from_id     TEXT NOT NULL,
  to_id       TEXT NOT NULL,
  description TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'pending', -- pending | in-progress | done
  due_date    DATE,
  product     TEXT,
  meeting_id  TEXT REFERENCES meetings(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── DECISIONS ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS decisions (
  id           TEXT PRIMARY KEY,
  topic        TEXT NOT NULL,
  owner_id     TEXT,
  relevant_ids TEXT[] NOT NULL DEFAULT '{}',
  status       TEXT NOT NULL DEFAULT 'open', -- open | approved | deferred
  outcome      TEXT NOT NULL DEFAULT '',
  notes        TEXT NOT NULL DEFAULT '',
  meeting_id   TEXT REFERENCES meetings(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  approved_by  TEXT,
  approved_at  TIMESTAMPTZ
);

-- ─── MEMBER UPDATES (one row per meeting × member) ───────────────────────────
CREATE TABLE IF NOT EXISTS updates (
  id          TEXT PRIMARY KEY,          -- "{meeting_id}-{user_id}"
  meeting_id  TEXT NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  user_id     TEXT NOT NULL,
  general     TEXT NOT NULL DEFAULT '',
  budget      TEXT NOT NULL DEFAULT '',
  needs_text  TEXT NOT NULL DEFAULT '',  -- renamed from "needs" to avoid reserved word
  launch      TEXT NOT NULL DEFAULT '',
  last_edited TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (meeting_id, user_id)
);

-- ─── INDEXES ──────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS tasks_meeting_id     ON tasks(meeting_id);
CREATE INDEX IF NOT EXISTS tasks_owner_id       ON tasks(owner_id);
CREATE INDEX IF NOT EXISTS tasks_status         ON tasks(status);
CREATE INDEX IF NOT EXISTS needs_meeting_id     ON needs(meeting_id);
CREATE INDEX IF NOT EXISTS decisions_meeting_id ON decisions(meeting_id);
CREATE INDEX IF NOT EXISTS updates_meeting_id   ON updates(meeting_id);

-- ─── ROW LEVEL SECURITY ───────────────────────────────────────────────────────
-- This is an internal team tool — allow full anon access.
-- Enable RLS but grant all operations to anon role.
ALTER TABLE meetings  ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks     ENABLE ROW LEVEL SECURITY;
ALTER TABLE needs     ENABLE ROW LEVEL SECURITY;
ALTER TABLE decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE updates   ENABLE ROW LEVEL SECURITY;

-- Allow all anon operations (internal tool — no per-user auth needed)
CREATE POLICY "anon_all_meetings"  ON meetings  FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_tasks"     ON tasks     FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_needs"     ON needs     FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_decisions" ON decisions FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_updates"   ON updates   FOR ALL TO anon USING (true) WITH CHECK (true);

-- ─── REALTIME ────────────────────────────────────────────────────────────────
-- Enables live updates so all team members see changes instantly.
ALTER PUBLICATION supabase_realtime ADD TABLE meetings, tasks, needs, decisions, updates;

-- ─── DONE ─────────────────────────────────────────────────────────────────────
-- After running this schema, open the app, go to Import/Settings,
-- and enter your Supabase Project URL + anon public key.
-- Both are found at: Supabase Dashboard → Settings → API
