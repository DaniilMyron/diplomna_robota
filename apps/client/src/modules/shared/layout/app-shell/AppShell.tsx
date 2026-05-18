import { Link } from 'react-router-dom';
import { useAuth } from '@/modules/auth';
import { MyTeamsPage } from '@/modules/teams';

export function AppShell() {
  const { user } = useAuth();

  return (
    <>
      <header>
        <Link to="/">Team Task Manager</Link>
        {user ? <img alt={user.displayName} src={user.avatarUrl} width="32" height="32" /> : null}
      </header>
      <main>
        <MyTeamsPage />
      </main>
    </>
  );
}
