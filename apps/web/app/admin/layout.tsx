import { requireRole } from '../../lib/authz';

// This is the pattern every role-specific route (/adviser, /lecturer,
// /rep) follows: check the role here, in the layout, using full
// Node.js/database access — not in middleware.
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireRole('admin');
  return <div>{children}</div>;
}
