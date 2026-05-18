import * as React from 'react';
import { useTeamBoardPage } from './use-team-board-page';

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
          {todoTasks.length === 0 ? <p>No tasks in Todo.</p> : todoTasks.map((task) => <TaskCard key={task.id} task={task} onUpdate={model.update} onDelete={model.remove} />)}
        </section>
        <section>
          <h2>In Progress</h2>
          {inProgressTasks.length === 0 ? <p>No tasks in In Progress.</p> : inProgressTasks.map((task) => <TaskCard key={task.id} task={task} onUpdate={model.update} onDelete={model.remove} />)}
        </section>
        <section>
          <h2>Done</h2>
          {doneTasks.length === 0 ? <p>No tasks in Done.</p> : doneTasks.map((task) => <TaskCard key={task.id} task={task} onUpdate={model.update} onDelete={model.remove} />)}
        </section>
      </div>
    </section>
  );
}

function TaskCard({
  task,
  onUpdate,
  onDelete,
}: {
  task: { id: string; title: string; description: string | null; status: 'TODO' | 'IN_PROGRESS' | 'DONE'; assignee: { id: string; displayName: string } | null };
  onUpdate: (taskId: string, input: { title: string; description?: string; assigneeId?: string; status: 'TODO' | 'IN_PROGRESS' | 'DONE' }) => Promise<void>;
  onDelete: (taskId: string) => Promise<void>;
}) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [title, setTitle] = React.useState(task.title);
  const [description, setDescription] = React.useState(task.description ?? '');
  const [assigneeId, setAssigneeId] = React.useState(task.assignee?.id ?? '');
  const [status, setStatus] = React.useState(task.status);

  React.useEffect(() => {
    setTitle(task.title);
    setDescription(task.description ?? '');
    setAssigneeId(task.assignee?.id ?? '');
    setStatus(task.status);
  }, [task]);

  return (
    <article>
      <strong>{task.title}</strong>
      {task.assignee ? <p>{task.assignee.displayName}</p> : null}
      {isEditing ? (
        <div>
          <label>
            Edit title
            <input aria-label="Edit title" value={title} onChange={(event) => setTitle(event.target.value)} />
          </label>
          <label>
            Edit description
            <input aria-label="Edit description" value={description} onChange={(event) => setDescription(event.target.value)} />
          </label>
          <label>
            Edit assignee ID
            <input aria-label="Edit assignee ID" value={assigneeId} onChange={(event) => setAssigneeId(event.target.value)} />
          </label>
          <label>
            Edit status
            <select aria-label="Edit status" value={status} onChange={(event) => setStatus(event.target.value as typeof status)}>
              <option value="TODO">Todo</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="DONE">Done</option>
            </select>
          </label>
          <button onClick={() => void onUpdate(task.id, {
            title: title.trim(),
            ...(description.trim() ? { description: description.trim() } : {}),
            ...(assigneeId.trim() ? { assigneeId: assigneeId.trim() } : {}),
            status,
          }).then(() => setIsEditing(false))}>Save task</button>
        </div>
      ) : (
        <button aria-label={`Edit ${task.title}`} onClick={() => setIsEditing(true)}>Edit</button>
      )}
      <button onClick={() => void onDelete(task.id)}>Delete task</button>
    </article>
  );
}
