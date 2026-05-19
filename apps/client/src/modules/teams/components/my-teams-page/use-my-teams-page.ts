import { useEffect, useState } from 'react';
import { useAuth } from '@/modules/auth';
import { HttpError } from '@/modules/shared/http/http-client';
import { createTeam, listTeams } from '../../api/teams-api';
import type { Team } from '../../teams.types';

export function useMyTeamsPage() {
  const { token } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (!token) {
      return;
    }

    void listTeams(token).then(setTeams).catch(() => setTeams([]));
  }, [token]);

  return {
    teams,
    name,
    error,
    isCreating,
    setName: (value: string) => {
      setName(value);
      setError('');
    },
    create: async () => {
      const trimmedName = name.trim();
      if (!token || !trimmedName || isCreating) {
        return;
      }

      setIsCreating(true);
      setError('');

      try {
        const team = await createTeam(token, trimmedName);
        setTeams((current) => [...current, team]);
        window.dispatchEvent(new Event('teams:changed'));
        setName('');
      } catch (caught) {
        if (caught instanceof HttpError && caught.code === 'TEAM_ALREADY_EXISTS') {
          setError('A team with this name already exists.');
          return;
        }
        if (caught instanceof HttpError && caught.code === 'NETWORK_ERROR') {
          setError('Server is not reachable. Start the backend and try again.');
          return;
        }

        setError('Could not create team.');
      } finally {
        setIsCreating(false);
      }
    },
  };
}
