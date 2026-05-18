import { request } from '@/modules/shared/http/http-client';
import type { BoardTeam } from '../board.types';

export function getBoardTeam(token: string, teamId: string) {
  return request<BoardTeam>(`/teams/${teamId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
