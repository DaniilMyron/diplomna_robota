import { useTeamBoardPage } from './use-team-board-page';
import type { Task, TaskStatus } from '@/modules/tasks';

const taskStatuses: Array<{ status: TaskStatus; label: string }> = [
  { status: 'TODO', label: 'Todo' },
  { status: 'IN_PROGRESS', label: 'In Progress' },
  { status: 'DONE', label: 'Done' },
];

export function TeamBoardPage() {
  const model = useTeamBoardPage();
  const { team } = model;
  const todoTasks = model.tasks.filter((task) => task.status === 'TODO');
  const inProgressTasks = model.tasks.filter((task) => task.status === 'IN_PROGRESS');
  const doneTasks = model.tasks.filter((task) => task.status === 'DONE');

  return (
    <section>
      <h1>{team ? `${team.name} Board` : 'Board'}</h1>
      {team ? (
        <section
          aria-label="Todo column"
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => void model.moveTask(event.dataTransfer.getData('text/task-id'), 'TODO')}
        >
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
        <section
          aria-label="In Progress column"
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => void model.moveTask(event.dataTransfer.getData('text/task-id'), 'IN_PROGRESS')}
        >
          <h2>Todo</h2>
          {todoTasks.length === 0 ? <p>No tasks in Todo.</p> : todoTasks.map((task) => <TaskCard key={task.id} task={task} onMove={model.moveTask} />)}
        </section>
        <section
          aria-label="Done column"
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => void model.moveTask(event.dataTransfer.getData('text/task-id'), 'DONE')}
        >
          <h2>In Progress</h2>
          {inProgressTasks.length === 0 ? <p>No tasks in In Progress.</p> : inProgressTasks.map((task) => <TaskCard key={task.id} task={task} onMove={model.moveTask} />)}
        </section>
        <section>
          <h2>Done</h2>
          {doneTasks.length === 0 ? <p>No tasks in Done.</p> : doneTasks.map((task) => <TaskCard key={task.id} task={task} onMove={model.moveTask} />)}
        </section>
      </div>
    </section>
  );
}

function TaskCard({ task, onMove }: { task: Task; onMove: (taskId: string, status: TaskStatus) => Promise<void> }) {
  return (
    <article draggable onDragStart={(event) => event.dataTransfer.setData('text/task-id', task.id)}>
      <strong>{task.title}</strong>
      {task.assignee ? <p>{task.assignee.displayName}</p> : null}
      {taskStatuses
        .filter(({ status }) => status !== task.status)
        .map(({ status, label }) => (
          <button key={status} aria-label={`Move ${task.title} to ${label}`} onClick={() => void onMove(task.id, status)}>
            {label}
          </button>
        ))}
    </article>
  );
}
