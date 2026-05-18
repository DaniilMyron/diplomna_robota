import { useEffect, useState } from 'react';
import { useAuth } from '@/modules/auth';
import { createTeam, listTeams } from '../../api/teams-api';
import type { Team } from '../../teams.types';

export function useMyTeamsPage() {
  const { token } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [name, setName] = useState('');

  useEffect(() => {
    if (!token) {
      return;
    }

    void listTeams(token).then(setTeams);
  }, [token]);

  return {
    teams,
    name,
    setName,
    create: async () => {
      if (!token || !name.trim()) {
        return;
      }

      const team = await createTeam(token, name.trim());
      setTeams((current) => [...current, team]);
      setName('');
    },
  };
}
