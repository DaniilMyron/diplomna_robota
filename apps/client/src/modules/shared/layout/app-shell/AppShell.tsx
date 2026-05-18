import { Link } from 'react-router-dom';
import { useAuth } from '@/modules/auth';

export function AppShell() {
  const { user } = useAuth();

  return (
    <>
      <header>
        <Link to="/">Team Task Manager</Link>
        {user ? <img alt={user.displayName} src={user.avatarUrl} width="32" height="32" /> : null}
      </header>
      <main>
        <h1>My Teams</h1>
      </main>
    </>
  );
}
