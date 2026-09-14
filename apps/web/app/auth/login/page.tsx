import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl text-bone mb-8">Log in to CampusOS</h1>
        <form className="space-y-4">
          <div>
            <label className="text-sm text-muted block mb-1">Email or username</label>
            <input className="w-full bg-surface border border-border rounded-sm px-4 py-3 text-bone" type="text" />
          </div>
          <div>
            <label className="text-sm text-muted block mb-1">Password</label>
            <input className="w-full bg-surface border border-border rounded-sm px-4 py-3 text-bone" type="password" />
          </div>
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-muted">
              <input type="checkbox" /> Remember me
            </label>
            <Link href="/auth/forgot-password" className="text-gold hover:text-gold-bright">
              Forgot password?
            </Link>
          </div>
          <button className="w-full bg-gold text-ink py-3 rounded-sm font-medium hover:bg-gold-bright transition-colors">
            Log in
          </button>
        </form>
        <p className="text-sm text-muted mt-6">
          New here?{' '}
          <Link href="/auth/register" className="text-gold hover:text-gold-bright">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
