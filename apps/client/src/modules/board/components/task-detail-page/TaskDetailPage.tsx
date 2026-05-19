import * as React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '@/modules/auth';
import { createTaskComment, getTask, listTaskComments, updateTask } from '@/modules/tasks';
import type { Task, TaskComment } from '@/modules/tasks';
import { getBoardTeam } from '../../api/board-api';
import type { BoardTeamMember } from '../../board.types';
import { filterMembers, resolveMember } from '../team-board-page/use-team-board-page';
import styles from './TaskDetailPage.module.css';

const statusLabels: Record<Task['status'], string> = {
  TODO: 'Todo',
  IN_PROGRESS: 'In Progress',
  DONE: 'Done',
};

const taskStatuses: Array<{ status: Task['status']; label: string }> = [
  { status: 'TODO', label: 'Todo' },
  { status: 'IN_PROGRESS', label: 'In Progress' },
  { status: 'DONE', label: 'Done' },
];

export function TaskDetailPage() {
  const { token } = useAuth();
  const { teamId = '', taskId = '' } = useParams();
  const [task, setTask] = React.useState<Task | null>(null);
  const [members, setMembers] = React.useState<BoardTeamMember[]>([]);
  const [comments, setComments] = React.useState<TaskComment[]>([]);
  const [commentBody, setCommentBody] = React.useState('');
  const [isSending, setIsSending] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [status, setStatus] = React.useState<Task['status']>('TODO');
  const [assigneeLookup, setAssigneeLookup] = React.useState('');
  const [assigneeError, setAssigneeError] = React.useState<string | null>(null);
  const assigneeOptions = filterMembers(members, assigneeLookup);

  React.useEffect(() => {
    if (!token || !teamId || !taskId) {
      return;
    }

    void Promise.all([
      getBoardTeam(token, teamId),
      getTask(token, teamId, taskId),
      listTaskComments(token, teamId, taskId),
    ]).then(([nextTeam, nextTask, nextComments]) => {
      setMembers(nextTeam.members);
      setTask(nextTask);
      setComments(nextComments);
    });
  }, [taskId, teamId, token]);

  React.useEffect(() => {
    if (!task) {
      return;
    }

    setTitle(task.title);
    setDescription(task.description ?? '');
    setStatus(task.status);
    setAssigneeLookup(task.assignee?.username ?? '');
    setAssigneeError(null);
  }, [task]);

  const sendComment = async () => {
    const body = commentBody.trim();
    if (!token || !teamId || !taskId || !body) {
      return;
    }

    setIsSending(true);
    try {
      const comment = await createTaskComment(token, teamId, taskId, { body });
      setComments((current) => [...current, comment]);
      setCommentBody('');
    } finally {
      setIsSending(false);
    }
  };

  const saveTask = async () => {
    if (!token || !teamId || !task || !title.trim()) {
      return;
    }

    const assignee = resolveMember(members, assigneeLookup);
    if (assigneeLookup.trim() && !assignee) {
      setAssigneeError('User does not exist.');
      return;
    }

    const nextTask = await updateTask(token, teamId, task.id, {
      title: title.trim(),
      ...(description.trim() ? { description: description.trim() } : {}),
      ...(assignee ? { assigneeId: assignee.id } : {}),
      status,
    });
    setTask(nextTask);
    setIsEditing(false);
  };

  return (
    <section className={styles.page}>
      <header className={styles.headingRow}>
        <div>
          <p className={styles.eyebrow}>Task details</p>
          <h1 className={styles.heading}>{task?.title ?? 'Task'}</h1>
        </div>
        <Link className={styles.backLink} to={`/teams/${teamId}/board`}>Back to board</Link>
      </header>

      <div className={styles.layout}>
        <section className={styles.panel} aria-label="Task fields">
          <div className={styles.panelHeadingRow}>
            <h2 className={styles.panelHeading}>Fields</h2>
            {task ? (
              isEditing ? (
                <div className={styles.headingActions}>
                  <button className={styles.secondaryButton} onClick={() => setIsEditing(false)}>Cancel</button>
                  <button className={styles.primaryButton} disabled={!title.trim()} onClick={() => void saveTask()}>Save</button>
                </div>
              ) : (
                <button className={styles.secondaryButton} onClick={() => setIsEditing(true)}>Edit</button>
              )
            ) : null}
          </div>
          {task ? (
            isEditing ? (
              <div className={styles.editForm}>
                <p className={styles.readonlyId}>ID: {task.id}</p>
                <label className={styles.editField}>
                  Title
                  <input className={styles.input} aria-label="Edit title" value={title} onChange={(event) => setTitle(event.target.value)} />
                </label>
                <label className={styles.editField}>
                  Description
                  <textarea className={styles.textarea} aria-label="Edit description" rows={7} value={description} onChange={(event) => setDescription(event.target.value)} />
                </label>
                <label className={styles.editField}>
                  Status
                  <select className={styles.input} aria-label="Edit status" value={status} onChange={(event) => setStatus(event.target.value as Task['status'])}>
                    {taskStatuses.map(({ status: option, label }) => (
                      <option key={option} value={option}>{label}</option>
                    ))}
                  </select>
                </label>
                <label className={styles.editField}>
                  Assignee
                  <input
                    className={`${styles.input} ${assigneeError ? styles.inputError : ''}`}
                    aria-label="Edit assignee"
                    aria-invalid={Boolean(assigneeError)}
                    list="task-detail-assignees"
                    value={assigneeLookup}
                    onChange={(event) => {
                      setAssigneeLookup(event.target.value);
                      setAssigneeError(null);
                    }}
                  />
                  <datalist id="task-detail-assignees">
                    {assigneeOptions.map((member) => (
                      <option key={member.id} value={member.username} label={member.displayName} />
                    ))}
                  </datalist>
                  {assigneeError ? <span className={styles.fieldError}>{assigneeError}</span> : null}
                </label>
              </div>
            ) : (
              <dl className={styles.fields}>
                <div className={styles.fieldRow}>
                  <dt>ID</dt>
                  <dd>{task.id}</dd>
                </div>
                <div className={styles.fieldRow}>
                  <dt>Title</dt>
                  <dd>{task.title}</dd>
                </div>
                <div className={styles.fieldRow}>
                  <dt>Description</dt>
                  <dd className={styles.descriptionBox}>{task.description || 'No description'}</dd>
                </div>
                <div className={styles.fieldRow}>
                  <dt>Status</dt>
                  <dd>{statusLabels[task.status]}</dd>
                </div>
                <div className={styles.fieldRow}>
                  <dt>Assignee</dt>
                  <dd>{task.assignee ? `${task.assignee.displayName} (@${task.assignee.username})` : 'Unassigned'}</dd>
                </div>
              </dl>
            )
          ) : (
            <p className={styles.emptyState}>Loading task...</p>
          )}
        </section>

        <section className={styles.panel} aria-label="Comments">
          <h2 className={styles.panelHeading}>Comments</h2>
          <div className={styles.chat}>
            {comments.length === 0 ? (
              <p className={styles.emptyState}>No comments yet.</p>
            ) : comments.map((comment) => (
              <article className={styles.comment} key={comment.id}>
                <div className={styles.commentMeta}>
                  <strong>{comment.author.displayName}</strong>
                  <time dateTime={comment.createdAt}>{formatCommentTime(comment.createdAt)}</time>
                </div>
                <p>{comment.body}</p>
              </article>
            ))}
          </div>
          <div className={styles.commentForm}>
            <label className={styles.commentField}>
              Message
              <textarea
                className={styles.textarea}
                aria-label="Message"
                rows={3}
                value={commentBody}
                onChange={(event) => setCommentBody(event.target.value)}
              />
            </label>
            <button className={styles.primaryButton} disabled={isSending || !commentBody.trim()} onClick={() => void sendComment()}>
              Send
            </button>
          </div>
        </section>
      </div>
    </section>
  );
}

function formatCommentTime(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}
