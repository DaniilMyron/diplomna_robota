import { useTeamBoardPage } from './use-team-board-page';

export function TeamBoardPage() {
  const model = useTeamBoardPage();
  const todoTasks = model.tasks.filter((task) => task.status === 'TODO');
  const inProgressTasks = model.tasks.filter((task) => task.status === 'IN_PROGRESS');
  const doneTasks = model.tasks.filter((task) => task.status === 'DONE');

  return (
    <section>
      <h1>{model.team ? `${model.team.name} Board` : 'Board'}</h1>
      <label>
        Task title
        <input aria-label="Task title" value={model.title} onChange={(event) => model.setTitle(event.target.value)} />
      </label>
      <label>
        Description
        <input aria-label="Description" value={model.description} onChange={(event) => model.setDescription(event.target.value)} />
      </label>
      <label>
        Assignee ID
        <input aria-label="Assignee ID" value={model.assigneeId} onChange={(event) => model.setAssigneeId(event.target.value)} />
      </label>
      <button onClick={() => void model.create()}>Create task</button>
      <div>
        <section>
          <h2>Todo</h2>
          {todoTasks.length === 0 ? <p>No tasks in Todo.</p> : todoTasks.map((task) => <TaskCard key={task.id} task={task} />)}
        </section>
        <section>
          <h2>In Progress</h2>
          {inProgressTasks.length === 0 ? <p>No tasks in In Progress.</p> : inProgressTasks.map((task) => <TaskCard key={task.id} task={task} />)}
        </section>
        <section>
          <h2>Done</h2>
          {doneTasks.length === 0 ? <p>No tasks in Done.</p> : doneTasks.map((task) => <TaskCard key={task.id} task={task} />)}
        </section>
      </div>
    </section>
  );
}

function TaskCard({ task }: { task: { title: string; assignee: { displayName: string } | null } }) {
  return (
    <article>
      <strong>{task.title}</strong>
      {task.assignee ? <p>{task.assignee.displayName}</p> : null}
    </article>
  );
}
