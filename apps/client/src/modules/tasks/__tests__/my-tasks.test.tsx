import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { expect, test, vi } from 'vitest';
import { MyTasksPage } from '../pages/MyTasksPage';

vi.mock('@/modules/auth', () => ({
  useAuth: () => ({
    token: 'jwt-token',
    user: { id: 'user-1', email: 'iryna@example.com', username: 'iryna', displayName: 'Iryna', avatarUrl: '/avatars/default.png' },
  }),
}));

function renderMyTasks() {
  render(
    <MemoryRouter initialEntries={['/tasks']}>
      <Routes>
        <Route path="/tasks" element={<MyTasksPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

test('a user sees their assigned tasks grouped by team with clickable links', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          { id: 'team-1', name: 'Platform' },
          { id: 'team-2', name: 'Design' },
        ],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          {
            id: 'task-1',
            title: 'Build task page',
            description: null,
            status: 'TODO',
            assignee: { id: 'user-1', username: 'iryna', displayName: 'Iryna', avatarUrl: '/avatars/default.png' },
          },
          {
            id: 'task-2',
            title: 'Someone else task',
            description: null,
            status: 'TODO',
            assignee: { id: 'user-2', username: 'maksym', displayName: 'Maksym', avatarUrl: '/avatars/default.png' },
          },
        ],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          {
            id: 'task-3',
            title: 'Review board flow',
            description: null,
            status: 'IN_PROGRESS',
            assignee: { id: 'user-1', username: 'iryna', displayName: 'Iryna', avatarUrl: '/avatars/default.png' },
          },
        ],
      }),
  );

  renderMyTasks();

  expect(await screen.findByRole('link', { name: 'Platform' })).toHaveAttribute('href', '/teams/team-1/board');
  expect(screen.getByRole('link', { name: 'Design' })).toHaveAttribute('href', '/teams/team-2/board');
  expect(screen.getByRole('link', { name: 'Build task page' })).toHaveAttribute('href', '/teams/team-1/tasks/task-1');
  expect(screen.getByRole('link', { name: 'Review board flow' })).toHaveAttribute('href', '/teams/team-2/tasks/task-3');
  expect(screen.queryByText('Someone else task')).not.toBeInTheDocument();
  await waitFor(() => expect(fetch).toHaveBeenCalledTimes(3));
});

test('a user sees an empty state when no tasks are assigned to them', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => [{ id: 'team-1', name: 'Platform' }] })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [{
          id: 'task-1',
          title: 'Unassigned task',
          description: null,
          status: 'TODO',
          assignee: null,
        }],
      }),
  );

  renderMyTasks();

  expect(await screen.findByText('No tasks assigned to you')).toBeInTheDocument();
  expect(screen.queryByText('Unassigned task')).not.toBeInTheDocument();
});

test('a user sees an empty state when assigned tasks cannot be loaded', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockRejectedValueOnce(new Error('Network error')),
  );

  renderMyTasks();

  expect(await screen.findByText('No tasks assigned to you')).toBeInTheDocument();
  expect(screen.queryByText('Loading tasks...')).not.toBeInTheDocument();
});
