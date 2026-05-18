import { fireEvent, render, screen } from '@testing-library/react';
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
      json: async () => ({ id: 'team-1', name: 'Platform', members: [], canManageMembership: false }),
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

test('a team owner can add a member inline from the board', async () => {
  vi.stubGlobal(
    'fetch',
    vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 'team-1',
          name: 'Platform',
          canManageMembership: true,
          members: [{ id: 'user-1', email: 'owner@example.com', username: 'owner', displayName: 'Owner', avatarUrl: '/avatars/default.png' }],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 'team-1',
          name: 'Platform',
          canManageMembership: true,
          members: [
            { id: 'user-1', email: 'owner@example.com', username: 'owner', displayName: 'Owner', avatarUrl: '/avatars/default.png' },
            { id: 'user-2', email: 'member@example.com', username: 'member', displayName: 'Member', avatarUrl: '/avatars/default.png' },
          ],
        }),
      }),
  );

  render(
    <MemoryRouter initialEntries={['/teams/team-1/board']}>
      <Routes>
        <Route path="/teams/:teamId/board" element={<TeamBoardPage />} />
      </Routes>
    </MemoryRouter>,
  );

  expect(await screen.findByText('Owner')).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('Add member'), { target: { value: '@member' } });
  fireEvent.click(screen.getByRole('button', { name: 'Add member' }));

  expect(await screen.findByText('Member')).toBeInTheDocument();
});
