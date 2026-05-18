import { request } from '@/modules/shared/http/http-client';
import type { BoardTeam } from '../board.types';

export function getBoardTeam(token: string, teamId: string) {
  return request<BoardTeam>(`/teams/${teamId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function addBoardTeamMember(token: string, teamId: string, lookup: string) {
  return request<BoardTeam>(`/teams/${teamId}/members`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ lookup }),
  });
}
