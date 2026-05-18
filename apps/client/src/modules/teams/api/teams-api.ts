import { request } from '@/modules/shared/http/http-client';
import type { Team } from '../teams.types';

export function listTeams(token: string) {
  return request<Team[]>('/teams', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function createTeam(token: string, name: string) {
  return request<Team>('/teams', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name }),
  });
}
