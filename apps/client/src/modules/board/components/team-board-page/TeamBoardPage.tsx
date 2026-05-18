import { useTeamBoardPage } from './use-team-board-page';

export function TeamBoardPage() {
  const { team } = useTeamBoardPage();

  return (
    <section>
      <h1>{team ? `${team.name} Board` : 'Board'}</h1>
      <div>
        <section>
          <h2>Todo</h2>
          <p>No tasks in Todo.</p>
        </section>
        <section>
          <h2>In Progress</h2>
          <p>No tasks in In Progress.</p>
        </section>
        <section>
          <h2>Done</h2>
          <p>No tasks in Done.</p>
        </section>
      </div>
    </section>
  );
}
