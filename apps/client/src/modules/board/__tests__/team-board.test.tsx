import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { expect, test, vi } from 'vitest';
import { TeamBoardPage } from '../pages/TeamBoardPage';

vi.mock('@/modules/auth', () => ({
  useAuth: () => ({ token: 'jwt-token' }),
}));

test('a team member can open a board with three empty columns', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'team-1', name: 'Platform' }),
    }),
  );

  render(
    <MemoryRouter initialEntries={['/teams/team-1/board']}>
      <Routes>
        <Route path="/teams/:teamId/board" element={<TeamBoardPage />} />
      </Routes>
    </MemoryRouter>,
  );

  expect(await screen.findByText('Platform Board')).toBeInTheDocument();
  expect(screen.getByText('Todo')).toBeInTheDocument();
  expect(screen.getByText('In Progress')).toBeInTheDocument();
  expect(screen.getByText('Done')).toBeInTheDocument();
  expect(screen.getByText('No tasks in Todo.')).toBeInTheDocument();
});
