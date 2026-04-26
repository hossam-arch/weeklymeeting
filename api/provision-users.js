// One-time endpoint to create the 7 team accounts in Supabase Auth.
// Requires SUPABASE_SERVICE_KEY set in Vercel environment variables.
// Call POST /api/provision-users from the Setup tab to seed all accounts.

const SUPABASE_URL = 'https://usqwgrwosfckzjxynwpd.supabase.co';

const TEAM_USERS = [
  { email: 'shams@orcas.io',   password: 'admin_access' },
  { email: 'amira@orcas.io',   password: 'admin_access' },
  { email: 'hossam@orcas.io',  password: 'admin_access' },
  { email: 'khalaf@orcas.io',  password: 'admin_access' },
  { email: 'bader@baims.com',  password: 'admin_access' },
  { email: 'yousef@baims.com', password: 'admin_access' },
  { email: 'ahmad@baims.com',  password: 'admin_access' },
];

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const serviceKey = process.env.SUPABASE_SERVICE_KEY;
  if (!serviceKey) {
    return res.status(500).json({
      error: 'SUPABASE_SERVICE_KEY not set. Add it in Vercel project settings → Environment Variables.',
    });
  }

  const results = [];
  for (const user of TEAM_USERS) {
    const r = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${serviceKey}`,
        'apikey':        serviceKey,
      },
      body: JSON.stringify({
        email:         user.email,
        password:      user.password,
        email_confirm: true, // skip email verification
      }),
    });
    const data = await r.json();
    results.push({
      email:  user.email,
      status: r.status,
      ok:     r.ok,
      error:  data.msg || data.error || null,
    });
  }

  res.json({ results });
}
