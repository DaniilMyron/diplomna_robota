import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/modules/auth';
import { listTeams, type Team } from '@/modules/teams';
import styles from './AppShell.module.css';

export function AppShell() {
  const { logout, token, user } = useAuth();
  const navigate = useNavigate();
  const [teams, setTeams] = useState<Team[]>([]);
  const [boardsOpen, setBoardsOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [avatarFailed, setAvatarFailed] = useState(false);
  const boardsMenuRef = useRef<HTMLDivElement>(null);
  const accountMenuRef = useRef<HTMLDivElement>(null);

  const refreshTeams = useCallback(() => {
    if (!token) {
      setTeams([]);
      return;
    }

    void listTeams(token).then(setTeams);
  }, [token]);

  useEffect(() => {
    refreshTeams();
  }, [refreshTeams]);

  useEffect(() => {
    setAvatarFailed(false);
  }, [user?.avatarUrl]);

  useEffect(() => {
    window.addEventListener('teams:changed', refreshTeams);

    return () => window.removeEventListener('teams:changed', refreshTeams);
  }, [refreshTeams]);

  useEffect(() => {
    function closeBoardsMenu(event: MouseEvent) {
      if (boardsMenuRef.current?.contains(event.target as Node)) {
        return;
      }

      setBoardsOpen(false);
    }

    document.addEventListener('mousedown', closeBoardsMenu);

    return () => document.removeEventListener('mousedown', closeBoardsMenu);
  }, []);

  useEffect(() => {
    function closeAccountMenu(event: MouseEvent) {
      if (accountMenuRef.current?.contains(event.target as Node)) {
        return;
      }

      setAccountOpen(false);
    }

    document.addEventListener('mousedown', closeAccountMenu);

    return () => document.removeEventListener('mousedown', closeAccountMenu);
  }, []);

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <Link className={styles.brand} to="/">Team Task Manager</Link>
        <nav className={styles.nav} aria-label="Primary navigation">
          <Link className={styles.homeLink} to="/">My Teams</Link>
          <Link className={styles.homeLink} to="/tasks">My Tasks</Link>
          {user ? (
            <div className={styles.boardsMenu} ref={boardsMenuRef}>
              <button
                className={styles.menuSummary}
                type="button"
                aria-expanded={boardsOpen}
                aria-haspopup="menu"
                onClick={() => setBoardsOpen((current) => !current)}
              >
                Boards
              </button>
              {boardsOpen ? (
                <div className={styles.menuPanel}>
                  {teams.length === 0 ? <p className={styles.emptyMenu}>Create a team to unlock its board.</p> : null}
                  {teams.map((team, index) => (
                    <section className={styles.teamGroup} key={team.id}>
                      {index > 0 ? <hr className={styles.divider} /> : null}
                      <h2 className={styles.teamHeading}>{team.name}</h2>
                      <Link
                        className={styles.boardLink}
                        to={`/teams/${team.id}/board`}
                        onClick={() => setBoardsOpen(false)}
                      >
                        {team.name} Board
                      </Link>
                    </section>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}
        </nav>
        {user ? (
          <div className={styles.account}>
            <div className={styles.accountMenu} ref={accountMenuRef}>
              <button
                className={styles.avatarButton}
                type="button"
                aria-label="Open account menu"
                aria-expanded={accountOpen}
                aria-haspopup="menu"
                onClick={() => setAccountOpen((current) => !current)}
              >
                {avatarFailed || !user.avatarUrl ? (
                  <span className={styles.avatarFallback} aria-label={user.displayName}>
                    {getInitials(user.displayName)}
                  </span>
                ) : (
                  <img
                    className={styles.avatar}
                    alt={user.displayName}
                    src={user.avatarUrl}
                    width="38"
                    height="38"
                    onError={() => setAvatarFailed(true)}
                    onLoad={() => setAvatarFailed(false)}
                  />
                )}
              </button>
              {accountOpen ? (
                <div className={styles.accountPanel} role="menu">
                  <Link className={styles.accountLink} to="/profile" onClick={() => setAccountOpen(false)}>
                    Profile
                  </Link>
                  <Link className={styles.accountLink} to="/settings" onClick={() => setAccountOpen(false)}>
                    Settings
                  </Link>
                </div>
              ) : null}
            </div>
            <button
              className={styles.logoutButton}
              onClick={() => {
                logout();
                navigate('/auth');
              }}
            >
              Log out
            </button>
          </div>
        ) : null}
      </header>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}

function getInitials(displayName: string) {
  return displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}
