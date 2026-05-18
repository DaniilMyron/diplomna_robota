import { useTeamBoardPage } from './use-team-board-page';

export function TeamBoardPage() {
  const model = useTeamBoardPage();
  const { team } = model;

  return (
    <section>
      <h1>{team ? `${team.name} Board` : 'Board'}</h1>
      {team ? (
        <section>
          <h2>Team Members</h2>
          <ul>
            {team.members.map((member) => (
              <li key={member.id}>{member.displayName}</li>
            ))}
          </ul>
          {team.canManageMembership ? (
            <div>
              <label>
                Add member
                <input aria-label="Add member" value={model.memberLookup} onChange={(event) => model.setMemberLookup(event.target.value)} />
              </label>
              <button onClick={() => void model.addMember()}>Add member</button>
            </div>
          ) : null}
        </section>
      ) : null}
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
