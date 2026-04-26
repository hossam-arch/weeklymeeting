
// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const COLORS = {
  brand: '#0B6E6B',
  brandDark: '#085956',
  brandLight: '#E6F4F4',
  bg: '#F5F6FA',
  card: '#FFFFFF',
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  red: '#EF4444',
  redLight: '#FEF2F2',
  green: '#10B981',
  greenLight: '#ECFDF5',
  blue: '#3B82F6',
  blueLight: '#EFF6FF',
  amber: '#F59E0B',
  amberLight: '#FFFBEB',
  purple: '#8B5CF6',
  purpleLight: '#F5F3FF',
  gray: '#6B7280',
  grayLight: '#F9FAFB',
};

// ─── TEAM ─────────────────────────────────────────────────────────────────────
const TEAM = [
  { id: 'shams',  name: 'Shams',  role: 'Marketing',       initials: 'S',  color: '#8B5CF6' },
  { id: 'amira',  name: 'Amira',  role: 'Orcas Lead',      initials: 'A',  color: '#10B981' },
  { id: 'yousef', name: 'Yousef', role: 'CEO',              initials: 'Y',  color: '#14B8A6' },
  { id: 'ahmad',  name: 'Ahmad',  role: 'Baims Kuwait',    initials: 'AH', color: '#F59E0B' },
  { id: 'bader',  name: 'Bader',  role: 'Product',         initials: 'B',  color: '#EC4899' },
  { id: 'hossam', name: 'Hossam', role: 'Strategy & Tech', initials: 'H',  color: '#6366F1' },
  { id: 'khalaf', name: 'Khalaf', role: 'Tech',            initials: 'K',  color: '#F97316' },
];

const PRODUCTS = ['Orcas', 'Baims', 'MedMasters', 'Group'];

const PRODUCT_COLORS = {
  Orcas:      { bg: '#E0F2FE', text: '#0369A1' },
  Baims:      { bg: '#FEF3C7', text: '#92400E' },
  MedMasters: { bg: '#FCE7F3', text: '#9D174D' },
  Group:      { bg: '#F3F4F6', text: '#374151' },
};

// ─── INITIAL DATA ─────────────────────────────────────────────────────────────
const MEETINGS_INIT = [
  {
    id: 'week17',
    label: 'Week 17',
    dateRange: 'Apr 21 – 27, 2026',
    startDate: '2026-04-21',
    endDate: '2026-04-27',
    chairmanId: 'yousef',
    status: 'Active',
    targetDuration: 90,
    actualDuration: null,
    createdAt: '2026-04-21T08:00:00Z',
  },
  {
    id: 'week16',
    label: 'Week 16',
    dateRange: 'Apr 14 – 20, 2026',
    startDate: '2026-04-14',
    endDate: '2026-04-20',
    chairmanId: 'hossam',
    status: 'Complete',
    targetDuration: 90,
    actualDuration: 85,
    createdAt: '2026-04-14T08:00:00Z',
  },
];

const UPDATES_INIT = {
  week17: {
    shams: {
      general: 'Launched new creative for Orcas Kuwait — CTR up 18%. Working on MedMasters awareness campaign for KSA.',
      budget: 'Q2 creative budget 62% utilized. Requesting $8K additional for influencer campaign.',
      needs: '',
      launch: 'Baims Ramadan campaign wrap-up report due Monday.',
      lastEdited: '2026-04-26T09:00:00Z',
    },
    amira: {
      general: 'UAE tutor acquisition up 24% WoW. Onboarded 12 new verified tutors. Session completion rate 91%.',
      budget: 'Tutor incentive budget on track. Requesting $3K for UAE performance bonus pool.',
      needs: '',
      launch: 'VIP tutor program launch set for May 5.',
      lastEdited: '2026-04-26T09:15:00Z',
    },
    yousef: {
      general: 'Board meeting prep complete. Investor deck updated with Q1 actuals. VC meetings next week in London.',
      budget: 'Group opex within target. Reviewing Q3 hiring plan.',
      needs: '',
      launch: 'Series A preparation — data room 70% complete.',
      lastEdited: '2026-04-26T09:30:00Z',
    },
    ahmad: {
      general: 'Baims Kuwait sales at 103% of target — best month since launch. Activated 2 new university partnerships.',
      budget: 'Marketing spend efficient. CAC improved by 14% vs last month.',
      needs: '',
      launch: 'GUST and AOU full integrations launching next week.',
      lastEdited: '2026-04-26T09:45:00Z',
    },
    bader: {
      general: 'Sprint 14 complete. Shipped: AI study planner (Baims), session replay (Orcas). 3 bugs closed.',
      budget: 'Design tool subscriptions up for renewal — $1,800.',
      needs: '',
      launch: 'MedMasters MCQ engine v2 — design complete, in dev.',
      lastEdited: '2026-04-26T10:00:00Z',
    },
    hossam: {
      general: 'Completed competitive analysis: 3 new regional players. Infra costs down 12% after migration.',
      budget: 'AWS costs under budget by $2.1K this month.',
      needs: '',
      launch: 'Metabase dashboard upgrades — live Thursday.',
      lastEdited: '2026-04-26T10:15:00Z',
    },
    khalaf: {
      general: 'Resolved 14 tickets. iOS booking fix deployed. Server uptime 99.94%. New CI/CD pipeline 40% faster.',
      budget: 'Dev tools budget on track.',
      needs: '',
      launch: 'MedMasters MCQ engine backend — 60% complete, on track.',
      lastEdited: '2026-04-26T10:30:00Z',
    },
  },
  week16: {
    shams:  { general: 'Orcas Kuwait Q1 results compiled.', budget: 'Within budget.', needs: '', launch: 'Ramadan campaign live.', lastEdited: '2026-04-19T10:00:00Z' },
    amira:  { general: 'UAE expansion prep underway.', budget: 'Tutor pool budget stable.', needs: '', launch: 'Tutor onboarding pipeline updated.', lastEdited: '2026-04-19T10:00:00Z' },
    yousef: { general: 'Investor updates sent.', budget: 'Q1 actuals finalized.', needs: '', launch: 'Series A prep started.', lastEdited: '2026-04-19T10:00:00Z' },
    ahmad:  { general: 'Strong week for Baims Kuwait.', budget: 'Marketing ROI improving.', needs: '', launch: 'GUST partnership signed.', lastEdited: '2026-04-19T10:00:00Z' },
    bader:  { general: 'Sprint 13 delivered.', budget: 'Tool costs reviewed.', needs: '', launch: 'Session replay design started.', lastEdited: '2026-04-19T10:00:00Z' },
    hossam: { general: 'AWS migration completed.', budget: 'Infra under budget.', needs: '', launch: 'Metabase setup in progress.', lastEdited: '2026-04-19T10:00:00Z' },
    khalaf: { general: '22 tickets closed.', budget: 'Dev tools budget on track.', needs: '', launch: 'CI/CD pipeline work started.', lastEdited: '2026-04-19T10:00:00Z' },
  },
};

const TASKS_INIT = [
  { id: 't1',  title: 'Fix iOS session booking bug',         ownerId: 'khalaf', product: 'Orcas',      quadrant: 'do-first', dueDate: '2026-04-28', isPrivate: false, status: 'active',    meetingId: 'week17', createdBy: 'khalaf', createdAt: '2026-04-26T10:00:00Z', description: '', completedAt: null },
  { id: 't2',  title: 'Approve Q3 product roadmap',          ownerId: 'yousef', product: 'Group',      quadrant: 'do-first', dueDate: '2026-04-30', isPrivate: false, status: 'active',    meetingId: 'week17', createdBy: 'yousef', createdAt: '2026-04-26T10:00:00Z', description: '', completedAt: null },
  { id: 't3',  title: 'Prepare investor one-pager (Baims)',  ownerId: 'shams',  product: 'Baims',      quadrant: 'do-first', dueDate: '2026-04-28', isPrivate: false, status: 'active',    meetingId: 'week17', createdBy: 'shams',  createdAt: '2026-04-26T10:00:00Z', description: '', completedAt: null },
  { id: 't4',  title: 'Launch VIP tutor program',            ownerId: 'amira',  product: 'Orcas',      quadrant: 'schedule', dueDate: '2026-05-05', isPrivate: false, status: 'active',    meetingId: 'week17', createdBy: 'amira',  createdAt: '2026-04-26T10:00:00Z', description: '', completedAt: null },
  { id: 't5',  title: 'GUST university integration',         ownerId: 'ahmad',  product: 'Baims',      quadrant: 'schedule', dueDate: '2026-05-07', isPrivate: false, status: 'active',    meetingId: 'week17', createdBy: 'ahmad',  createdAt: '2026-04-26T10:00:00Z', description: '', completedAt: null },
  { id: 't6',  title: 'Metabase dashboard upgrade',          ownerId: 'hossam', product: 'Group',      quadrant: 'schedule', dueDate: '2026-05-02', isPrivate: false, status: 'active',    meetingId: 'week17', createdBy: 'hossam', createdAt: '2026-04-26T10:00:00Z', description: '', completedAt: null },
  { id: 't7',  title: 'MedMasters MCQ engine v2',            ownerId: 'bader',  product: 'MedMasters', quadrant: 'schedule', dueDate: '2026-05-15', isPrivate: false, status: 'active',    meetingId: 'week17', createdBy: 'bader',  createdAt: '2026-04-26T10:00:00Z', description: '', completedAt: null },
  { id: 't8',  title: 'Q2 creative budget review',           ownerId: 'shams',  product: 'Group',      quadrant: 'schedule', dueDate: '2026-05-10', isPrivate: false, status: 'active',    meetingId: 'week17', createdBy: 'shams',  createdAt: '2026-04-26T10:00:00Z', description: '', completedAt: null },
  { id: 't9',  title: 'Adobe Creative Suite renewal',        ownerId: 'shams',  product: 'Group',      quadrant: 'delegate', dueDate: '2026-04-30', isPrivate: false, status: 'active',    meetingId: 'week17', createdBy: 'shams',  createdAt: '2026-04-26T10:00:00Z', description: '', completedAt: null },
  { id: 't10', title: 'Review infra architecture proposal',  ownerId: 'hossam', product: 'Group',      quadrant: 'eliminate',dueDate: null,         isPrivate: false, status: 'active',    meetingId: 'week17', createdBy: 'hossam', createdAt: '2026-04-26T10:00:00Z', description: '', completedAt: null },
  { id: 't11', title: 'Finalize investor deck for London',   ownerId: 'yousef', product: 'Group',      quadrant: 'do-first', dueDate: '2026-04-29', isPrivate: true,  status: 'active',    meetingId: 'week17', createdBy: 'yousef', createdAt: '2026-04-26T10:00:00Z', description: '', completedAt: null },
  { id: 't12', title: 'Series A data room completion',       ownerId: 'yousef', product: 'Group',      quadrant: 'do-first', dueDate: '2026-05-01', isPrivate: true,  status: 'active',    meetingId: 'week17', createdBy: 'yousef', createdAt: '2026-04-26T10:00:00Z', description: '', completedAt: null },
];

const NEEDS_INIT = [
  { id: 'n1', fromId: 'shams',  toId: 'yousef', description: 'Approve Adobe Creative Suite renewal ($2,400/yr)', status: 'pending', dueDate: '2026-04-30', product: 'Group', meetingId: 'week17', createdAt: '2026-04-26T10:00:00Z' },
  { id: 'n2', fromId: 'bader',  toId: 'yousef', description: 'Approve Q3 product roadmap priorities',            status: 'pending', dueDate: '2026-04-30', product: 'Group', meetingId: 'week17', createdAt: '2026-04-26T10:00:00Z' },
  { id: 'n3', fromId: 'yousef', toId: 'hossam', description: 'Send updated KPI model before London trip',        status: 'done',    dueDate: '2026-04-27', product: 'Group', meetingId: 'week17', createdAt: '2026-04-26T10:00:00Z' },
];

const DECISIONS_INIT = [
  { id: 'd1', topic: 'Series A fundraising timeline',  ownerId: 'yousef', relevantIds: ['yousef','hossam','bader'],          status: 'open',     outcome: '', notes: 'Targeting Q3 2026 close. VC meetings in London next week will inform timeline.', meetingId: 'week17', createdAt: '2026-04-26T10:00:00Z', approvedBy: null, approvedAt: null },
  { id: 'd2', topic: 'Q3 hiring plan approval',        ownerId: 'yousef', relevantIds: ['yousef','bader','khalaf'],           status: 'open',     outcome: '', notes: 'Need to finalize headcount for product and tech teams before May 15.', meetingId: 'week17', createdAt: '2026-04-26T10:00:00Z', approvedBy: null, approvedAt: null },
  { id: 'd3', topic: 'AOU partnership agreement',      ownerId: 'ahmad',  relevantIds: ['ahmad','yousef'],                    status: 'approved', outcome: 'Approved. Ahmad to sign agreement by Apr 28.', notes: '', meetingId: 'week16', createdAt: '2026-04-19T10:00:00Z', approvedBy: 'yousef', approvedAt: '2026-04-19T11:00:00Z' },
];

// ─── KPI DATA ──────────────────────────────────────────────────────────────────
const KPI_DATA = {
  orcas: {
    name: 'Orcas', color: '#0369A1',
    markets: ['Kuwait', 'KSA', 'UAE'],
    totalSales: 121000, salesTarget: 123000,
    metrics: [
      { label: 'Sales $',       rows: [{ market:'Kuwait', actual:42000, target:40000 }, { market:'KSA', actual:28000, target:35000 }, { market:'UAE', actual:51000, target:48000 }] },
      { label: 'Collections $', rows: [{ market:'Kuwait', actual:38000, target:36000 }, { market:'KSA', actual:22000, target:30000 }, { market:'UAE', actual:44000, target:42000 }] },
      { label: 'New Users',     rows: [{ market:'Kuwait', actual:890,   target:800   }, { market:'KSA', actual:620,   target:750   }, { market:'UAE', actual:1100,  target:1000  }] },
      { label: 'Total Users',   rows: [{ market:'Kuwait', actual:12400, target:12000 }, { market:'KSA', actual:8200,  target:9000  }, { market:'UAE', actual:15600, target:15000 }] },
      { label: 'Leads',         rows: [{ market:'Kuwait', actual:2200,  target:2000  }, { market:'KSA', actual:1800,  target:2200  }, { market:'UAE', actual:2800,  target:2500  }] },
      { label: 'CPL',           rows: [{ market:'Kuwait', actual:4.2,   target:5.0   }, { market:'KSA', actual:6.1,   target:5.5   }, { market:'UAE', actual:3.8,   target:4.5   }] },
      { label: 'CAC',           rows: [{ market:'Kuwait', actual:38,    target:45    }, { market:'KSA', actual:52,    target:48    }, { market:'UAE', actual:34,    target:40    }] },
    ],
  },
  baims: {
    name: 'Baims', color: '#92400E',
    markets: ['Kuwait', 'KSA', 'Egypt'],
    totalSales: 61000, salesTarget: 65000,
    metrics: [
      { label: 'Sales $',       rows: [{ market:'Kuwait', actual:31000, target:30000 }, { market:'KSA', actual:18000, target:20000 }, { market:'Egypt', actual:12000, target:15000 }] },
      { label: 'Collections $', rows: [{ market:'Kuwait', actual:28000, target:27000 }, { market:'KSA', actual:15000, target:18000 }, { market:'Egypt', actual:9000,  target:12000 }] },
      { label: 'New Users',     rows: [{ market:'Kuwait', actual:540,   target:500   }, { market:'KSA', actual:380,   target:450   }, { market:'Egypt', actual:710,   target:800   }] },
      { label: 'Total Users',   rows: [{ market:'Kuwait', actual:8200,  target:8000  }, { market:'KSA', actual:5400,  target:6000  }, { market:'Egypt', actual:9800,  target:11000 }] },
      { label: 'Leads',         rows: [{ market:'Kuwait', actual:1400,  target:1300  }, { market:'KSA', actual:1100,  target:1400  }, { market:'Egypt', actual:1900,  target:2200  }] },
      { label: 'CPL',           rows: [{ market:'Kuwait', actual:5.1,   target:5.5   }, { market:'KSA', actual:7.2,   target:6.5   }, { market:'Egypt', actual:3.4,   target:4.0   }] },
      { label: 'CAC',           rows: [{ market:'Kuwait', actual:44,    target:50    }, { market:'KSA', actual:61,    target:55    }, { market:'Egypt', actual:28,    target:35    }] },
    ],
  },
  medmasters: {
    name: 'MedMasters', color: '#9D174D',
    markets: ['Kuwait', 'UK', 'Australia'],
    totalSales: 38000, salesTarget: 42000,
    metrics: [
      { label: 'Sales $',       rows: [{ market:'Kuwait', actual:18000, target:18000 }, { market:'UK',        actual:12000, target:14000 }, { market:'Australia', actual:8000,  target:10000 }] },
      { label: 'Collections $', rows: [{ market:'Kuwait', actual:16000, target:16000 }, { market:'UK',        actual:10000, target:12000 }, { market:'Australia', actual:6500,  target:8500  }] },
      { label: 'New Users',     rows: [{ market:'Kuwait', actual:320,   target:300   }, { market:'UK',        actual:210,   target:250   }, { market:'Australia', actual:140,   target:200   }] },
      { label: 'Total Users',   rows: [{ market:'Kuwait', actual:3800,  target:3600  }, { market:'UK',        actual:2200,  target:2800  }, { market:'Australia', actual:1400,  target:1800  }] },
      { label: 'Leads',         rows: [{ market:'Kuwait', actual:820,   target:800   }, { market:'UK',        actual:560,   target:700   }, { market:'Australia', actual:380,   target:500   }] },
      { label: 'CPL',           rows: [{ market:'Kuwait', actual:6.2,   target:7.0   }, { market:'UK',        actual:9.8,   target:9.0   }, { market:'Australia', actual:11.2,  target:10.0  }] },
      { label: 'CAC',           rows: [{ market:'Kuwait', actual:58,    target:65    }, { market:'UK',        actual:82,    target:75    }, { market:'Australia', actual:96,    target:85    }] },
    ],
  },
};

// ─── UTILITIES ────────────────────────────────────────────────────────────────
function getTeamMember(id) {
  return TEAM.find(m => m.id === id) || null;
}

function generateId(prefix = 'id') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function formatRelativeTime(isoString) {
  if (!isoString) return '';
  const now = new Date();
  const then = new Date(isoString);
  const diffMs = now - then;
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1)   return 'just now';
  if (diffMins < 60)  return `${diffMins}m ago`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24)   return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7)   return `${diffDays} days ago`;
  return then.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function isOverdue(dateStr) {
  if (!dateStr) return false;
  return new Date(dateStr + 'T23:59:59') < new Date();
}

// ─── SHARED COMPONENTS ────────────────────────────────────────────────────────
function Avatar({ memberId, size = 32 }) {
  const member = getTeamMember(memberId);
  if (!member) return null;
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: member.color + '22', border: `2px solid ${member.color}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.35, fontWeight: 700, color: member.color,
      flexShrink: 0, letterSpacing: '-0.5px',
    }}>
      {member.initials}
    </div>
  );
}

function AvatarGroup({ memberIds, size = 28 }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {memberIds.map(id => <Avatar key={id} memberId={id} size={size} />)}
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    pending:    { bg: '#FEF3C7', color: '#92400E', label: 'Pending' },
    'in-progress':{ bg: '#DBEAFE', color: '#1D4ED8', label: 'In Progress' },
    done:       { bg: '#D1FAE5', color: '#065F46', label: 'Done' },
    open:       { bg: '#FEF3C7', color: '#92400E', label: 'Open' },
    approved:   { bg: '#D1FAE5', color: '#065F46', label: 'Approved' },
    deferred:   { bg: '#F3F4F6', color: '#374151', label: 'Deferred' },
    Active:     { bg: '#D1FAE5', color: '#065F46', label: 'Active' },
    Draft:      { bg: '#F3F4F6', color: '#374151', label: 'Draft' },
    Complete:   { bg: '#DBEAFE', color: '#1D4ED8', label: 'Complete' },
  };
  const s = map[status] || { bg: '#F3F4F6', color: '#374151', label: status };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '2px 8px', borderRadius: 12,
      fontSize: 11, fontWeight: 600, letterSpacing: '0.2px',
      background: s.bg, color: s.color,
    }}>
      {s.label}
    </span>
  );
}

function ProductChip({ product }) {
  if (!product) return null;
  const c = PRODUCT_COLORS[product] || { bg: '#F3F4F6', text: '#374151' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '1px 7px', borderRadius: 10,
      fontSize: 11, fontWeight: 600,
      background: c.bg, color: c.text,
    }}>
      {product}
    </span>
  );
}

function Btn({ children, onClick, variant = 'secondary', size = 'md', disabled = false, style: extraStyle = {} }) {
  const [hov, setHov] = React.useState(false);
  const base = {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    border: 'none', borderRadius: 8, cursor: disabled ? 'not-allowed' : 'pointer',
    fontWeight: 600, transition: 'all .15s', opacity: disabled ? 0.5 : 1,
    outline: 'none',
  };
  const sizes = { sm: { padding: '4px 10px', fontSize: 12 }, md: { padding: '7px 14px', fontSize: 13 }, lg: { padding: '10px 20px', fontSize: 14 } };
  const variants = {
    primary:   { background: hov ? COLORS.brandDark : COLORS.brand,   color: '#fff' },
    secondary: { background: hov ? '#E9EBF0' : '#F3F4F6',             color: COLORS.textPrimary },
    danger:    { background: hov ? '#DC2626' : '#EF4444',             color: '#fff' },
    ghost:     { background: hov ? '#F3F4F6' : 'transparent',         color: COLORS.textSecondary },
    success:   { background: hov ? '#059669' : COLORS.green,          color: '#fff' },
  };
  return (
    <button
      style={{ ...base, ...sizes[size], ...variants[variant], ...extraStyle }}
      onClick={disabled ? undefined : onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      {children}
    </button>
  );
}

function Card({ children, style: s = {}, onClick }) {
  const [hov, setHov] = React.useState(false);
  return (
    <div
      style={{
        background: COLORS.card, border: `1px solid ${COLORS.border}`,
        borderRadius: 10, padding: 16,
        boxShadow: hov && onClick ? '0 2px 8px rgba(0,0,0,0.08)' : '0 1px 3px rgba(0,0,0,0.04)',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'box-shadow .15s',
        ...s,
      }}
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      {children}
    </div>
  );
}

function Modal({ title, children, onClose, width = 500 }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000,
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: COLORS.card, borderRadius: 12, width, maxWidth: '95vw',
        maxHeight: '90vh', overflow: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
      }}>
        <div style={{
          padding: '16px 20px', borderBottom: `1px solid ${COLORS.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{ fontWeight: 700, fontSize: 15 }}>{title}</span>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 18, color: COLORS.textMuted, lineHeight: 1, padding: 4,
          }}>×</button>
        </div>
        <div style={{ padding: 20 }}>{children}</div>
      </div>
    </div>
  );
}

function Input({ label, value, onChange, type = 'text', placeholder = '', required = false }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {label && <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.textSecondary }}>{label}{required && ' *'}</label>}
      <input
        type={type} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          padding: '8px 10px', borderRadius: 7, border: `1px solid ${COLORS.border}`,
          fontSize: 13, color: COLORS.textPrimary, background: '#fff', outline: 'none',
          width: '100%',
        }}
      />
    </div>
  );
}

function Textarea({ label, value, onChange, placeholder = '', rows = 3 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {label && <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.textSecondary }}>{label}</label>}
      <textarea
        value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} rows={rows}
        style={{
          padding: '8px 10px', borderRadius: 7, border: `1px solid ${COLORS.border}`,
          fontSize: 13, color: COLORS.textPrimary, background: '#fff', outline: 'none',
          width: '100%', resize: 'vertical', fontFamily: 'inherit',
        }}
      />
    </div>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {label && <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.textSecondary }}>{label}</label>}
      <select
        value={value} onChange={e => onChange(e.target.value)}
        style={{
          padding: '8px 10px', borderRadius: 7, border: `1px solid ${COLORS.border}`,
          fontSize: 13, color: COLORS.textPrimary, background: '#fff', outline: 'none',
          width: '100%', cursor: 'pointer',
        }}
      >
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

function EmptyState({ icon = '📋', text }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '32px 16px', color: COLORS.textMuted,
      textAlign: 'center', gap: 8,
    }}>
      <span style={{ fontSize: 28 }}>{icon}</span>
      <span style={{ fontSize: 13 }}>{text}</span>
    </div>
  );
}

// Expose everything globally
window.COLORS = COLORS;
window.TEAM = TEAM;
window.PRODUCTS = PRODUCTS;
window.PRODUCT_COLORS = PRODUCT_COLORS;
window.MEETINGS_INIT = MEETINGS_INIT;
window.UPDATES_INIT = UPDATES_INIT;
window.TASKS_INIT = TASKS_INIT;
window.NEEDS_INIT = NEEDS_INIT;
window.DECISIONS_INIT = DECISIONS_INIT;
window.KPI_DATA = KPI_DATA;
window.getTeamMember = getTeamMember;
window.generateId = generateId;
window.formatRelativeTime = formatRelativeTime;
window.formatDate = formatDate;
window.isOverdue = isOverdue;
window.Avatar = Avatar;
window.AvatarGroup = AvatarGroup;
window.StatusBadge = StatusBadge;
window.ProductChip = ProductChip;
window.Btn = Btn;
window.Card = Card;
window.Modal = Modal;
window.Input = Input;
window.Textarea = Textarea;
window.Select = Select;
window.EmptyState = EmptyState;

// ─── PRODUCT LOGO SVGs ────────────────────────────────────────────────────────
function BaimsLogo({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ borderRadius: size * 0.22, flexShrink: 0 }}>
      <rect width="100" height="100" rx="22" fill="#1A9CE0"/>
      {/* Open book — left page */}
      <path d="M48 70 L48 46 L17 31 L15 54 Z" fill="white"/>
      {/* Open book — right page */}
      <path d="M52 70 L52 46 L83 31 L85 54 Z" fill="white"/>
    </svg>
  );
}

function OrcasLogo({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ borderRadius: size * 0.22, flexShrink: 0 }}>
      <rect width="100" height="100" rx="22" fill="#62B8EA"/>
      <circle cx="50" cy="50" r="7"  fill="white"/>
      <circle cx="50" cy="50" r="17" fill="none" stroke="white" strokeWidth="5.5"/>
      <circle cx="50" cy="50" r="28" fill="none" stroke="white" strokeWidth="5.5"/>
      <circle cx="50" cy="50" r="39" fill="none" stroke="white" strokeWidth="5"/>
    </svg>
  );
}

function MedMastersLogo({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ borderRadius: size * 0.05, flexShrink: 0 }}>
      <rect width="100" height="100" fill="#3DAF56"/>
      <rect x="12" y="20" width="21" height="60" rx="10.5" fill="none" stroke="#F0EDD5" strokeWidth="5"/>
      <rect x="39.5" y="20" width="21" height="60" rx="10.5" fill="none" stroke="#F0EDD5" strokeWidth="5"/>
      <rect x="67" y="20" width="21" height="60" rx="10.5" fill="none" stroke="#F0EDD5" strokeWidth="5"/>
    </svg>
  );
}

window.BaimsLogo = BaimsLogo;
window.OrcasLogo = OrcasLogo;
window.MedMastersLogo = MedMastersLogo;
