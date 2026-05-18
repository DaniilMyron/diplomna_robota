import * as React from 'react';
import { Link } from 'react-router-dom';
import type { Task, TaskStatus } from '@/modules/tasks';
import { useTeamBoardPage } from './use-team-board-page';
import styles from './TeamBoardPage.module.css';

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
    <section className={styles.page}>
      <header className={styles.headingRow}>
        <h1 className={styles.heading}>{team ? `${team.name} Board` : 'Board'}</h1>
        <Link className={styles.backLink} to="/">Back to teams</Link>
      </header>
      <div className={styles.topGrid}>
        {team ? (
          <section className={styles.panel}>
            <h2 className={styles.panelHeading}>Team Members</h2>
            <ul className={styles.members}>
              {team.members.map((member) => (
                <li className={styles.member} key={member.id}>{member.displayName}</li>
              ))}
            </ul>
            {team.canManageMembership ? (
              <div className={styles.inlineForm}>
                <label className={styles.field}>
                  Add member
                  <input
                    className={styles.input}
                    aria-label="Add member"
                    value={model.memberLookup}
                    onChange={(event) => model.setMemberLookup(event.target.value)}
                  />
                </label>
                <button className={styles.secondaryButton} onClick={() => void model.addMember()}>Add member</button>
              </div>
            ) : null}
          </section>
        ) : null}
        <section className={styles.panel}>
          <h2 className={styles.panelHeading}>Create task</h2>
          <div className={styles.taskForm}>
            <label className={styles.field}>
              Task title
              <input className={styles.input} aria-label="Task title" value={model.title} onChange={(event) => model.setTitle(event.target.value)} />
            </label>
            <label className={styles.field}>
              Description
              <input className={styles.input} aria-label="Description" value={model.description} onChange={(event) => model.setDescription(event.target.value)} />
            </label>
            <label className={styles.field}>
              Assignee ID
              <input className={styles.input} aria-label="Assignee ID" value={model.assigneeId} onChange={(event) => model.setAssigneeId(event.target.value)} />
            </label>
            <button className={styles.primaryButton} onClick={() => void model.create()}>Create task</button>
          </div>
        </section>
      </div>
      <div className={styles.board}>
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
      className={styles.column}
      aria-label={`${label} column`}
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => void model.moveTask(event.dataTransfer.getData('text/task-id'), status)}
    >
      <h2 className={styles.columnHeading}>{label}</h2>
      {tasks.length === 0 ? <p className={styles.emptyColumn}>No tasks in {label}.</p> : tasks.map((task) => <TaskCard key={task.id} task={task} onUpdate={model.update} onDelete={model.remove} onMove={model.moveTask} />)}
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
    <article className={styles.card} draggable onDragStart={(event) => event.dataTransfer.setData('text/task-id', task.id)}>
      <strong className={styles.cardTitle}>{task.title}</strong>
      {task.assignee ? <p className={styles.assignee}>{task.assignee.displayName}</p> : null}
      <div className={styles.actions}>
        {taskStatuses
          .filter(({ status: candidate }) => candidate !== task.status)
          .map(({ status: candidate, label }) => (
            <button className={styles.secondaryButton} key={candidate} aria-label={`Move ${task.title} to ${label}`} onClick={() => void onMove(task.id, candidate)}>
              {label}
            </button>
          ))}
      </div>
      {isEditing ? (
        <div className={styles.editPanel}>
          <label className={styles.field}>
            Edit title
            <input className={styles.input} aria-label="Edit title" value={title} onChange={(event) => setTitle(event.target.value)} />
          </label>
          <label className={styles.field}>
            Edit description
            <input className={styles.input} aria-label="Edit description" value={description} onChange={(event) => setDescription(event.target.value)} />
          </label>
          <label className={styles.field}>
            Edit assignee ID
            <input className={styles.input} aria-label="Edit assignee ID" value={assigneeId} onChange={(event) => setAssigneeId(event.target.value)} />
          </label>
          <label className={styles.field}>
            Edit status
            <select className={styles.select} aria-label="Edit status" value={status} onChange={(event) => setStatus(event.target.value as TaskStatus)}>
              {taskStatuses.map(({ status: option, label }) => (
                <option key={option} value={option}>{label}</option>
              ))}
            </select>
          </label>
          <button className={styles.primaryButton} onClick={() => void onUpdate(task.id, {
            title: title.trim(),
            ...(description.trim() ? { description: description.trim() } : {}),
            ...(assigneeId.trim() ? { assigneeId: assigneeId.trim() } : {}),
            status,
          }).then(() => setIsEditing(false))}>Save task</button>
        </div>
      ) : (
        <button className={styles.secondaryButton} aria-label={`Edit ${task.title}`} onClick={() => setIsEditing(true)}>Edit</button>
      )}
      <button className={styles.dangerButton} onClick={() => void onDelete(task.id)}>Delete task</button>
    </article>
  );
}
