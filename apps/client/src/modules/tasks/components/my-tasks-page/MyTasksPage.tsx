import { Link } from 'react-router-dom';
import { useMyTasksPage } from './use-my-tasks-page';
import styles from './MyTasksPage.module.css';

export function MyTasksPage() {
  const model = useMyTasksPage();

  return (
    <section className={styles.page}>
      <header className={styles.headingRow}>
        <div>
          <h1 className={styles.heading}>My Tasks</h1>
          <p className={styles.subheading}>Tasks assigned to you across your teams.</p>
        </div>
      </header>

      <section className={styles.taskList} aria-label="My tasks">
        {model.isLoading ? <p className={styles.emptyState}>Loading tasks...</p> : null}
        {!model.isLoading && model.teams.length === 0 ? (
          <div className={styles.emptyState}>
            <strong>No tasks assigned to you</strong>
            <span>Assigned tasks from your teams will appear here.</span>
          </div>
        ) : null}
        {!model.isLoading && model.teams.length > 0 ? (
          <div className={styles.groups}>
            {model.teams.map((team) => (
              <section className={styles.teamGroup} key={team.id}>
                <Link className={styles.teamLink} to={`/teams/${team.id}/board`}>{team.name}</Link>
                <hr className={styles.divider} />
                <ul className={styles.tasks}>
                  {team.tasks.map((task) => (
                    <li key={task.id}>
                      <Link className={styles.taskLink} to={`/teams/${team.id}/tasks/${task.id}`}>{task.title}</Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        ) : null}
      </section>
    </section>
  );
}
