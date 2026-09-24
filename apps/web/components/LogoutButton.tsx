'use client';

import { useRouter } from 'next/navigation';

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
    router.refresh();
  }

  return (
    <button onClick={handleLogout} className="text-sm text-muted hover:text-bone rounded-sm px-3 py-2 block w-full text-left">
      Log out
    </button>
  );
}
