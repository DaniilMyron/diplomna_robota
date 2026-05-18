import * as React from 'react';
import type { Task, TaskStatus } from '@/modules/tasks';
import { useTeamBoardPage } from './use-team-board-page';

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
        <TaskColumn label="Todo" status="TODO" tasks={todoTasks} model={model} />
        <TaskColumn label="In Progress" status="IN_PROGRESS" tasks={inProgressTasks} model={model} />
        <TaskColumn label="Done" status="DONE" tasks={doneTasks} model={model} />
      </div>
    </section>
  );
}

function TaskColumn({
  label,
  status,
  tasks,
  model,
}: {
  label: string;
  status: TaskStatus;
  tasks: Task[];
  model: ReturnType<typeof useTeamBoardPage>;
}) {
  return (
    <section
      aria-label={`${label} column`}
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => void model.moveTask(event.dataTransfer.getData('text/task-id'), status)}
    >
      <h2>{label}</h2>
      {tasks.length === 0 ? <p>No tasks in {label}.</p> : tasks.map((task) => <TaskCard key={task.id} task={task} onUpdate={model.update} onDelete={model.remove} onMove={model.moveTask} />)}
    </section>
  );
}

function TaskCard({
  task,
  onUpdate,
  onDelete,
  onMove,
}: {
  task: Task;
  onUpdate: (taskId: string, input: { title: string; description?: string; assigneeId?: string; status: TaskStatus }) => Promise<void>;
  onDelete: (taskId: string) => Promise<void>;
  onMove: (taskId: string, status: TaskStatus) => Promise<void>;
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
    <article draggable onDragStart={(event) => event.dataTransfer.setData('text/task-id', task.id)}>
      <strong>{task.title}</strong>
      {task.assignee ? <p>{task.assignee.displayName}</p> : null}
      {taskStatuses
        .filter(({ status: candidate }) => candidate !== task.status)
        .map(({ status: candidate, label }) => (
          <button key={candidate} aria-label={`Move ${task.title} to ${label}`} onClick={() => void onMove(task.id, candidate)}>
            {label}
          </button>
        ))}
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
            <select aria-label="Edit status" value={status} onChange={(event) => setStatus(event.target.value as TaskStatus)}>
              {taskStatuses.map(({ status: option, label }) => (
                <option key={option} value={option}>{label}</option>
              ))}
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
