import { useMyTeamsPage } from './use-my-teams-page';

export function MyTeamsPage() {
  const model = useMyTeamsPage();

  return (
    <section>
      <h1>My Teams</h1>
      {model.teams.length === 0 ? <p>No teams yet. Create your first team to get started.</p> : null}
      <ul>
        {model.teams.map((team) => (
          <li key={team.id}>{team.name}</li>
        ))}
      </ul>
      <label>
        Team name
        <input aria-label="Team name" value={model.name} onChange={(event) => model.setName(event.target.value)} />
      </label>
      <button onClick={() => void model.create()}>Create team</button>
    </section>
  );
}
