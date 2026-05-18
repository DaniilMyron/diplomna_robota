import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/modules/auth';
import { addBoardTeamMember, getBoardTeam } from '../../api/board-api';
import { createTask } from '@/modules/tasks';
import type { Task } from '@/modules/tasks';
import type { BoardTeam } from '../../board.types';

export function useTeamBoardPage() {
  const { token } = useAuth();
  const { teamId = '' } = useParams();
  const [team, setTeam] = useState<BoardTeam | null>(null);
  const [memberLookup, setMemberLookup] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assigneeId, setAssigneeId] = useState('');

  useEffect(() => {
    if (!token || !teamId) {
      return;
    }

    void getBoardTeam(token, teamId).then(setTeam);
  }, [teamId, token]);

  return {
    team,
    memberLookup,
    setMemberLookup,
    async addMember() {
      if (!token || !teamId || !memberLookup.trim()) {
        return;
      }

      const updatedTeam = await addBoardTeamMember(token, teamId, memberLookup.trim());
      setTeam(updatedTeam);
      setMemberLookup('');
    },
    tasks,
    title,
    description,
    assigneeId,
    setTitle,
    setDescription,
    setAssigneeId,
    create: async () => {
      if (!token || !teamId || !title.trim()) {
        return;
      }

      const task = await createTask(token, teamId, {
        title: title.trim(),
        ...(description.trim() ? { description: description.trim() } : {}),
        ...(assigneeId.trim() ? { assigneeId: assigneeId.trim() } : {}),
      });
      setTasks((current) => [...current, task]);
      setTitle('');
      setDescription('');
      setAssigneeId('');
    },
  };
}
