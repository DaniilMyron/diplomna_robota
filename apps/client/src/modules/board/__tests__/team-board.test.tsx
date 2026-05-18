import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { expect, test, vi } from 'vitest';
import { TeamBoardPage } from '../pages/TeamBoardPage';

vi.mock('@/modules/auth', () => ({
  useAuth: () => ({ token: 'jwt-token' }),
}));

function renderBoard() {
  render(
    <MemoryRouter initialEntries={['/teams/team-1/board']}>
      <Routes>
        <Route path="/teams/:teamId/board" element={<TeamBoardPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

test('a team member can open a board with three empty columns', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'team-1', name: 'Platform', members: [], canManageMembership: false }),
    }),
  );

  renderBoard();

  expect(await screen.findByText('Platform Board')).toBeInTheDocument();
  expect(screen.getByText('Todo')).toBeInTheDocument();
  expect(screen.getByText('In Progress')).toBeInTheDocument();
  expect(screen.getByText('Done')).toBeInTheDocument();
  expect(screen.getByText('No tasks in Todo.')).toBeInTheDocument();
});

test('a team owner can add a member inline from the board', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn()
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

  renderBoard();
  expect(await screen.findByText('Owner')).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('Add member'), { target: { value: '@member' } });
  fireEvent.click(screen.getByRole('button', { name: 'Add member' }));
  expect(await screen.findByText('Member')).toBeInTheDocument();
});

test('a team member can create a todo task and see its compact card', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'team-1', name: 'Platform', members: [], canManageMembership: false }),
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

  renderBoard();
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

test('a team member can edit task details from the board and see the persisted card state', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'team-1', name: 'Platform', members: [], canManageMembership: false }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 'task-1',
          title: 'Draft card',
          description: null,
          status: 'TODO',
          assignee: null,
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 'task-1',
          title: 'Ready card',
          description: 'Reviewed',
          status: 'IN_PROGRESS',
          assignee: { id: 'user-2', displayName: 'Maksym' },
        }),
      }),
  );

  renderBoard();
  await screen.findByText('Platform Board');
  fireEvent.change(screen.getByLabelText('Task title'), { target: { value: 'Draft card' } });
  fireEvent.click(screen.getByRole('button', { name: 'Create task' }));
  fireEvent.click(await screen.findByRole('button', { name: 'Edit Draft card' }));

  fireEvent.change(screen.getByLabelText('Edit title'), { target: { value: 'Ready card' } });
  fireEvent.change(screen.getByLabelText('Edit description'), { target: { value: 'Reviewed' } });
  fireEvent.change(screen.getByLabelText('Edit assignee ID'), { target: { value: 'user-2' } });
  fireEvent.change(screen.getByLabelText('Edit status'), { target: { value: 'IN_PROGRESS' } });
  fireEvent.click(screen.getByRole('button', { name: 'Save task' }));

  expect(await screen.findByText('Ready card')).toBeInTheDocument();
  expect(screen.getByText('Maksym')).toBeInTheDocument();
  expect(screen.queryByText('No tasks in In Progress.')).not.toBeInTheDocument();
  await waitFor(() =>
    expect(fetch).toHaveBeenLastCalledWith(
      '/api/teams/team-1/tasks/task-1',
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({
          title: 'Ready card',
          description: 'Reviewed',
          assigneeId: 'user-2',
          status: 'IN_PROGRESS',
        }),
      }),
    ),
  );
});

test('a team member can delete an obsolete task from the board', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'team-1', name: 'Platform', members: [], canManageMembership: false }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 'task-1',
          title: 'Obsolete card',
          description: null,
          status: 'TODO',
          assignee: null,
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => undefined,
      }),
  );

  renderBoard();
  await screen.findByText('Platform Board');
  fireEvent.change(screen.getByLabelText('Task title'), { target: { value: 'Obsolete card' } });
  fireEvent.click(screen.getByRole('button', { name: 'Create task' }));
  expect(await screen.findByText('Obsolete card')).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: 'Delete task' }));

  await waitFor(() => expect(screen.queryByText('Obsolete card')).not.toBeInTheDocument());
  expect(screen.getByText('No tasks in Todo.')).toBeInTheDocument();
  await waitFor(() =>
    expect(fetch).toHaveBeenLastCalledWith(
      '/api/teams/team-1/tasks/task-1',
      expect.objectContaining({ method: 'DELETE' }),
    ),
  );
});
