import { useEffect, useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '@/modules/auth';
import { listTeams, type Team } from '@/modules/teams';

export function AppShell() {
  const { token, user } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);

  useEffect(() => {
    if (!token) {
      return;
    }

    void listTeams(token).then(setTeams);
  }, [token]);

  return (
    <>
      <header>
        <Link to="/">Team Task Manager</Link>
        {user ? (
          <details>
            <summary>Boards</summary>
            {teams.map((team, index) => (
              <section key={team.id}>
                {index > 0 ? <hr /> : null}
                <h2>{team.name}</h2>
                <Link to={`/teams/${team.id}/board`}>{team.name} Board</Link>
              </section>
            ))}
          </details>
        ) : null}
        {user ? <img alt={user.displayName} src={user.avatarUrl} width="32" height="32" /> : null}
      </header>
      <main>
        <Outlet />
      </main>
    </>
  );
}
