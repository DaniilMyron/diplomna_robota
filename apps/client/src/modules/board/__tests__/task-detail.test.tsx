import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { expect, test, vi } from 'vitest';
import { TaskDetailPage } from '../pages/TaskDetailPage';

vi.mock('@/modules/auth', () => ({
  useAuth: () => ({ token: 'jwt-token' }),
}));

function renderTaskDetail() {
  render(
    <MemoryRouter initialEntries={['/teams/team-1/tasks/task-1']}>
      <Routes>
        <Route path="/teams/:teamId/tasks/:taskId" element={<TaskDetailPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

test('a team member can read task fields and add chat comments', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 'team-1',
          name: 'Platform',
          canManageMembership: false,
          members: [{ id: 'user-1', email: 'iryna@example.com', username: 'iryna', displayName: 'Iryna', avatarUrl: '/avatars/default.png' }],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 'task-1',
          title: 'Review auth flow',
          description: 'Check redirects',
          status: 'IN_PROGRESS',
          assignee: { id: 'user-1', username: 'iryna', displayName: 'Iryna', avatarUrl: '/avatars/default.png' },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 'comment-1',
          body: 'Looks ready',
          author: { id: 'user-1', username: 'iryna', displayName: 'Iryna', avatarUrl: '/avatars/default.png' },
          createdAt: '2026-05-19T10:00:00Z',
        }),
      }),
  );

  renderTaskDetail();

  expect(await screen.findByRole('heading', { name: 'Review auth flow' })).toBeInTheDocument();
  expect(screen.getByText('Check redirects')).toBeInTheDocument();
  expect(screen.getByText('In Progress')).toBeInTheDocument();
  expect(screen.getByText('Iryna (@iryna)')).toBeInTheDocument();

  fireEvent.change(screen.getByLabelText('Message'), { target: { value: 'Looks ready' } });
  fireEvent.click(screen.getByRole('button', { name: 'Send' }));

  expect(await screen.findByText('Looks ready')).toBeInTheDocument();
  await waitFor(() =>
    expect(fetch).toHaveBeenLastCalledWith(
      '/api/teams/team-1/tasks/task-1/comments',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ body: 'Looks ready' }),
      }),
    ),
  );
});

test('a team member can edit title description and assignee from task details', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 'team-1',
          name: 'Platform',
          canManageMembership: false,
          members: [
            { id: 'user-1', email: 'iryna@example.com', username: 'iryna', displayName: 'Iryna', avatarUrl: '/avatars/default.png' },
            { id: 'user-2', email: 'maksym@example.com', username: 'maksym', displayName: 'Maksym', avatarUrl: '/avatars/default.png' },
          ],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 'task-1',
          title: 'Draft details',
          description: 'Small note',
          status: 'TODO',
          assignee: { id: 'user-1', username: 'iryna', displayName: 'Iryna', avatarUrl: '/avatars/default.png' },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 'task-1',
          title: 'Ready details',
          description: 'Longer edited description',
          status: 'IN_PROGRESS',
          assignee: { id: 'user-2', username: 'maksym', displayName: 'Maksym', avatarUrl: '/avatars/default.png' },
        }),
      }),
  );

  renderTaskDetail();

  expect(await screen.findByRole('heading', { name: 'Draft details' })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
  fireEvent.change(screen.getByLabelText('Edit title'), { target: { value: 'Ready details' } });
  fireEvent.change(screen.getByLabelText('Edit description'), { target: { value: 'Longer edited description' } });
  fireEvent.change(screen.getByLabelText('Edit status'), { target: { value: 'IN_PROGRESS' } });
  fireEvent.change(screen.getByLabelText('Edit assignee'), { target: { value: 'maksym' } });
  fireEvent.click(screen.getByRole('button', { name: 'Save' }));

  expect(await screen.findByRole('heading', { name: 'Ready details' })).toBeInTheDocument();
  expect(screen.getByText('Longer edited description')).toBeInTheDocument();
  expect(screen.getByText('Maksym (@maksym)')).toBeInTheDocument();
  await waitFor(() =>
    expect(fetch).toHaveBeenLastCalledWith(
      '/api/teams/team-1/tasks/task-1',
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({
          title: 'Ready details',
          description: 'Longer edited description',
          assigneeId: 'user-2',
          status: 'IN_PROGRESS',
        }),
      }),
    ),
  );
});
