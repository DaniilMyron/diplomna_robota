import { useEffect, useState } from 'react';
import { useAuth } from '@/modules/auth';
import { listTeams } from '@/modules/teams';
import { listTasks } from '../../api/tasks-api';
import type { Task } from '../../tasks.types';

export type MyTasksTeam = {
  id: string;
  name: string;
  tasks: Task[];
};

export function useMyTasksPage() {
  const { token, user } = useAuth();
  const userId = user?.id;
  const [teams, setTeams] = useState<MyTasksTeam[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isCurrent = true;

    async function loadMyTasks() {
      if (!token || !userId) {
        setTeams([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const nextTeams = await listTeams(token);
        const tasksByTeam = await Promise.all(
          nextTeams.map(async (team) => ({
            ...team,
            tasks: (await listTasks(token, team.id)).filter((task) => task.assignee?.id === userId),
          })),
        );

        if (isCurrent) {
          setTeams(tasksByTeam.filter((team) => team.tasks.length > 0));
        }
      } catch {
        if (isCurrent) {
          setTeams([]);
        }
      } finally {
        if (isCurrent) {
          setIsLoading(false);
        }
      }
    }

    void loadMyTasks();

    return () => {
      isCurrent = false;
    };
  }, [token, userId]);

  return {
    isLoading,
    teams,
  };
}
