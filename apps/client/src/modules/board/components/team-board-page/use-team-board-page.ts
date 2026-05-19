import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/modules/auth';
import { HttpError } from '@/modules/shared/http/http-client';
import { createTask, deleteTask, listTasks, updateTask, updateTaskStatus } from '@/modules/tasks';
import type { Task, TaskStatus } from '@/modules/tasks';
import { addBoardTeamMember, getBoardTeam, removeBoardTeamMember } from '../../api/board-api';
import type { BoardTeam, BoardTeamMember } from '../../board.types';

export function useTeamBoardPage() {
  const { token, user } = useAuth();
  const { teamId = '' } = useParams();
  const [team, setTeam] = useState<BoardTeam | null>(null);
  const [memberLookup, setMemberLookup] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assigneeLookup, setAssigneeLookupState] = useState('');
  const [memberLookupError, setMemberLookupError] = useState<string | null>(null);
  const [memberNotice, setMemberNotice] = useState<string | null>(null);
  const [assigneeError, setAssigneeError] = useState<string | null>(null);

  useEffect(() => {
    if (!token || !teamId) {
      return;
    }

    void Promise.all([
      getBoardTeam(token, teamId),
      listTasks(token, teamId),
    ]).then(([nextTeam, nextTasks]) => {
      setTeam(nextTeam);
      setTasks(nextTasks);
    });
  }, [teamId, token]);

  return {
    teamId,
    currentUserId: user?.id ?? null,
    team,
    memberLookup,
    setMemberLookup(value: string) {
      setMemberLookup(value);
      setMemberLookupError(null);
      setMemberNotice(null);
    },
    memberLookupError,
    memberNotice,
    async addMember() {
      const username = memberLookup.trim();
      if (!token || !teamId || !username) {
        return;
      }
      try {
        const updatedTeam = await addBoardTeamMember(token, teamId, username);
        setTeam(updatedTeam);
        setMemberLookup('');
        setMemberLookupError(null);
        setMemberNotice(`User ${username} has been added.`);
      } catch (error) {
        if (error instanceof HttpError && error.code === 'TEAM_MEMBER_NOT_FOUND') {
          setMemberLookupError('User with this username was not found.');
          return;
        }
        if (error instanceof HttpError && error.code === 'TEAM_MEMBER_ALREADY_EXISTS') {
          setMemberLookupError('User is already added to this team.');
          return;
        }
        throw error;
      }
    },
    async removeMember(userId: string) {
      if (!token || !teamId) {
        return;
      }
      const updatedTeam = await removeBoardTeamMember(token, teamId, userId);
      setTeam(updatedTeam);
      setMemberLookupError(null);
      setMemberNotice(null);
    },
    tasks,
    title,
    description,
    assigneeLookup,
    assigneeError,
    assigneeOptions: filterMembers(team?.members ?? [], assigneeLookup),
    setTitle,
    setDescription,
    setAssigneeLookup(value: string) {
      setAssigneeLookupState(value);
      setAssigneeError(null);
    },
    async create() {
      if (!token || !teamId || !title.trim()) {
        return;
      }
      const assignee = resolveMember(team?.members ?? [], assigneeLookup);
      if (assigneeLookup.trim() && !assignee) {
        setAssigneeError('User does not exist.');
        return;
      }
      const task = await createTask(token, teamId, {
        title: title.trim(),
        ...(description.trim() ? { description: description.trim() } : {}),
        ...(assignee ? { assigneeId: assignee.id } : {}),
      });
      setTasks((current) => [...current, task]);
      setTitle('');
      setDescription('');
      setAssigneeLookupState('');
      setAssigneeError(null);
    },
    async update(taskId: string, input: { title: string; description?: string; assigneeId?: string; status: TaskStatus }) {
      if (!token || !teamId) {
        return;
      }
      const task = await updateTask(token, teamId, taskId, input);
      setTasks((current) => current.map((candidate) => (candidate.id === task.id ? task : candidate)));
    },
    async moveTask(taskId: string, status: TaskStatus) {
      if (!token || !teamId) {
        return;
      }
      const task = await updateTaskStatus(token, teamId, taskId, { status });
      setTasks((current) => current.map((candidate) => (candidate.id === task.id ? task : candidate)));
    },
    async remove(taskId: string) {
      if (!token || !teamId) {
        return;
      }
      await deleteTask(token, teamId, taskId);
      setTasks((current) => current.filter((task) => task.id !== taskId));
    },
  };
}

export function filterMembers(members: BoardTeamMember[], lookup: string) {
  const normalizedLookup = lookup.trim().toLowerCase();
  if (!normalizedLookup) {
    return members;
  }

  return members.filter((member) =>
    member.username.toLowerCase().includes(normalizedLookup)
    || member.displayName.toLowerCase().includes(normalizedLookup),
  );
}

export function resolveMember(members: BoardTeamMember[], lookup: string) {
  const normalizedLookup = lookup.trim().toLowerCase();
  if (!normalizedLookup) {
    return null;
  }

  return members.find((member) =>
    member.username.toLowerCase() === normalizedLookup
    || member.displayName.toLowerCase() === normalizedLookup,
  ) ?? null;
}
