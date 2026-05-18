import { fireEvent, render, screen, waitFor } from '@testing-library/react';
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

test('a team member can create a todo task and see its compact card', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'team-1', name: 'Platform' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 'task-1',
          title: 'Ship board cards',
          description: 'Keep them compact',
          status: 'TODO',
          assignee: { id: 'user-1', displayName: 'Iryna' },
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

  await screen.findByText('Platform Board');
  fireEvent.change(screen.getByLabelText('Task title'), { target: { value: 'Ship board cards' } });
  fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'Keep them compact' } });
  fireEvent.change(screen.getByLabelText('Assignee ID'), { target: { value: 'user-1' } });
  fireEvent.click(screen.getByRole('button', { name: 'Create task' }));

  expect(await screen.findByText('Ship board cards')).toBeInTheDocument();
  expect(screen.getByText('Iryna')).toBeInTheDocument();
  expect(screen.queryByText('No tasks in Todo.')).not.toBeInTheDocument();
  await waitFor(() =>
    expect(fetch).toHaveBeenLastCalledWith(
      '/api/teams/team-1/tasks',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          title: 'Ship board cards',
          description: 'Keep them compact',
          assigneeId: 'user-1',
        }),
      }),
    ),
  );
});
