import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/modules/auth';
import { getBoardTeam } from '../../api/board-api';
import type { BoardTeam } from '../../board.types';

export function useTeamBoardPage() {
  const { token } = useAuth();
  const { teamId = '' } = useParams();
  const [team, setTeam] = useState<BoardTeam | null>(null);

  useEffect(() => {
    if (!token || !teamId) {
      return;
    }

    void getBoardTeam(token, teamId).then(setTeam);
  }, [teamId, token]);

  return { team };
}
