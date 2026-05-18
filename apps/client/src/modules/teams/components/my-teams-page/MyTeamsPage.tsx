import { useMyTeamsPage } from './use-my-teams-page';
import { Link } from 'react-router-dom';
import styles from './MyTeamsPage.module.css';

export function MyTeamsPage() {
  const model = useMyTeamsPage();

  return (
    <section className={styles.page}>
      <header className={styles.headingRow}>
        <div>
          <h1 className={styles.heading}>My Teams</h1>
          <p className={styles.subheading}>Choose a team board or create a new workspace for your group.</p>
        </div>
      </header>
      <div className={styles.content}>
        <section className={styles.teamList} aria-label="Teams">
          {model.teams.length === 0 ? (
            <div className={styles.emptyState}>
              <strong>No teams yet</strong>
              <span>Create your first team to get started.</span>
            </div>
          ) : (
            <ul className={styles.list}>
              {model.teams.map((team) => (
                <li key={team.id}>
                  <Link className={styles.teamLink} to={`/teams/${team.id}/board`}>{team.name}</Link>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className={styles.createPanel} aria-label="Create team">
          <h2 className={styles.panelHeading}>Create team</h2>
          <label className={styles.field}>
            Team name
            <input
              className={styles.input}
              aria-label="Team name"
              value={model.name}
              onChange={(event) => model.setName(event.target.value)}
            />
          </label>
          <button className={styles.button} onClick={() => void model.create()}>Create team</button>
        </section>
      </div>
    </section>
  );
}
