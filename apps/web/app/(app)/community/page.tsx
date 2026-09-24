import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { getAuthContext } from '../../../lib/authz';
import { getCommunityFeed, getPostableNodes, createPost } from '../../../lib/community';

const TABS = [
  { value: undefined, label: 'All' },
  { value: 'faculty', label: 'Faculty' },
  { value: 'department', label: 'Department' },
  { value: 'course_group', label: 'Course' },
];

export default async function CommunityPage({
  searchParams,
}: {
  searchParams: { type?: string };
}) {
  const ctx = await getAuthContext();
  if (!ctx) redirect('/auth/login');

  const [posts, postableNodes] = await Promise.all([
    getCommunityFeed(ctx.userId, searchParams.type),
    getPostableNodes(ctx.userId),
  ]);

  // Server Action — runs on the server, no separate API route needed for
  // this mutation since it's only ever called from this page's own form.
  async function submitPost(formData: FormData) {
    'use server';
    const authCtx = await getAuthContext();
    if (!authCtx) redirect('/auth/login');
    const orgNodeId = formData.get('orgNodeId') as string;
    const body = formData.get('body') as string;
    await createPost(authCtx.userId, orgNodeId, body);
    revalidatePath('/community');
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl text-bone mb-1">Community</h1>
      <p className="text-muted mb-6">Connect, share, learn and grow with your fellow students.</p>

      <div className="flex gap-2 mb-6 flex-wrap">
        {TABS.map((tab) => (
          <TabLink key={tab.label} value={tab.value} label={tab.label} active={searchParams.type === tab.value} />
        ))}
      </div>

      {postableNodes.length > 0 && (
        <form action={submitPost} className="bg-surface border border-border rounded-md p-4 mb-8">
          <textarea
            name="body"
            required
            placeholder="Share something with the community..."
            rows={3}
            className="w-full bg-ink border border-border rounded-sm px-3 py-2 text-bone text-sm mb-3 resize-none"
          />
          <div className="flex justify-between items-center gap-3">
            <select
              name="orgNodeId"
              required
              className="bg-ink border border-border rounded-sm px-3 py-2 text-sm text-bone"
            >
              {postableNodes.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.name}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="bg-gold text-ink text-sm px-4 py-2 rounded-sm font-medium hover:bg-gold-bright transition-colors"
            >
              Post
            </button>
          </div>
        </form>
      )}

      {posts.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-3">
          {posts.map((post) => (
            <div key={post.id} className="bg-surface border border-border rounded-md p-4">
              <div className="flex items-center gap-2 mb-2">
                <p className="text-bone text-sm">{post.authorName}</p>
                <span className="text-muted text-xs">·</span>
                <span className="text-gold text-xs">{post.orgNodeName}</span>
                <span className="text-muted text-xs ml-auto">
                  {new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </span>
              </div>
              <p className="text-bone/90 text-sm leading-relaxed">{post.body}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TabLink({ value, label, active }: { value?: string; label: string; active: boolean }) {
  const href = value ? `/community?type=${value}` : '/community';
  return (
    <a
      href={href}
      className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${
        active
          ? 'bg-gold text-ink border-gold font-medium'
          : 'border-border text-muted hover:border-gold/40 hover:text-bone'
      }`}
    >
      {label}
    </a>
  );
}

function EmptyState() {
  return (
    <div className="border border-dashed border-border rounded-md p-8 text-center">
      <p className="text-bone mb-1">Nothing here yet</p>
      <p className="text-muted text-sm">
        Posts from your faculty, department, and course groups will show up here.
      </p>
    </div>
  );
}
