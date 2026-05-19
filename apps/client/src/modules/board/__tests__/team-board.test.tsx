import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { expect, test, vi } from 'vitest';
import { TeamBoardPage } from '../pages/TeamBoardPage';

vi.mock('@/modules/auth', () => ({
  useAuth: () => ({
    token: 'jwt-token',
    user: { id: 'user-1', email: 'owner@example.com', username: 'owner', displayName: 'Owner', avatarUrl: '/avatars/default.png' },
  }),
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
    vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'team-1', name: 'Platform', members: [], canManageMembership: false }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
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
        json: async () => [{
          id: 'task-1',
          title: 'Assigned task',
          description: null,
          status: 'TODO',
          assignee: { id: 'user-2', username: 'member', displayName: 'Member', avatarUrl: '/avatars/default.png' },
        }],
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
  fireEvent.change(screen.getByLabelText('Add member'), { target: { value: 'member' } });
  fireEvent.click(screen.getByRole('button', { name: 'Add member' }));
  expect(await screen.findByText('Member')).toBeInTheDocument();
  expect(screen.getByText('User member has been added.')).toBeInTheDocument();
});

test('a team owner can remove a member from the board popover', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn()
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
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [{
          id: 'task-1',
          title: 'Assigned task',
          description: null,
          status: 'TODO',
          assignee: { id: 'user-2', username: 'member', displayName: 'Member', avatarUrl: '/avatars/default.png' },
        }],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 'team-1',
          name: 'Platform',
          canManageMembership: true,
          members: [{ id: 'user-1', email: 'owner@example.com', username: 'owner', displayName: 'Owner', avatarUrl: '/avatars/default.png' }],
        }),
      }),
  );

  renderBoard();
  expect(await screen.findByText('Assigned task')).toBeInTheDocument();
  expect(screen.getAllByText('Member').length).toBeGreaterThan(0);
  fireEvent.click(screen.getByRole('button', { name: 'Manage Member' }));
  fireEvent.click(screen.getByRole('button', { name: 'Delete user' }));

  await waitFor(() => expect(screen.queryByRole('button', { name: 'Manage Member' })).not.toBeInTheDocument());
  expect(screen.queryByText('Member')).not.toBeInTheDocument();
  expect(screen.getByLabelText('Unassigned')).toBeInTheDocument();
  await waitFor(() =>
    expect(fetch).toHaveBeenLastCalledWith(
      '/api/teams/team-1/members/user-2',
      expect.objectContaining({ method: 'DELETE' }),
    ),
  );
});

test('a team owner cannot open the membership popover for themselves', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn()
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
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      }),
  );

  renderBoard();
  expect(await screen.findByText('Owner')).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Manage Owner' })).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Manage Member' })).toBeInTheDocument();
});

test('a team owner member popover closes after an outside click', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn()
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
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      }),
  );

  renderBoard();
  fireEvent.click(await screen.findByRole('button', { name: 'Manage Member' }));
  expect(screen.getByRole('button', { name: 'Delete user' })).toBeInTheDocument();

  fireEvent.mouseDown(document.body);

  await waitFor(() => expect(screen.queryByRole('button', { name: 'Delete user' })).not.toBeInTheDocument());
});

test('adding an existing team member shows an inline error', async () => {
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
        json: async () => [],
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 409,
        json: async () => ({ code: 'TEAM_MEMBER_ALREADY_EXISTS' }),
      }),
  );

  renderBoard();
  expect(await screen.findByText('Owner')).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('Add member'), { target: { value: 'owner' } });
  fireEvent.click(screen.getByRole('button', { name: 'Add member' }));

  expect(await screen.findByText('User is already added to this team.')).toBeInTheDocument();
  expect(screen.getByLabelText('Add member')).toHaveAttribute('aria-invalid', 'true');
});


test('a team member can create a todo task and see its compact card', async () => {
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
        json: async () => [],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 'task-1',
          title: 'Ship board cards',
          description: 'Keep them compact',
          status: 'TODO',
          assignee: { id: 'user-1', username: 'iryna', displayName: 'Iryna', avatarUrl: '/avatars/default.png' },
        }),
      }),
  );

  renderBoard();
  await screen.findByText('Platform Board');
  fireEvent.change(screen.getByLabelText('Task title'), { target: { value: 'Ship board cards' } });
  fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'Keep them compact' } });
  fireEvent.change(screen.getByLabelText('Assignee'), { target: { value: 'iryna' } });
  fireEvent.click(screen.getByRole('button', { name: 'Create task' }));

  expect(await screen.findByText('Ship board cards')).toBeInTheDocument();
  expect(screen.getAllByText('Iryna').length).toBeGreaterThan(0);
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
          json: async () => ({
            id: 'team-1',
            name: 'Platform',
            canManageMembership: false,
            members: [{ id: 'user-2', email: 'maksym@example.com', username: 'maksym', displayName: 'Maksym', avatarUrl: '/avatars/default.png' }],
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
          assignee: { id: 'user-2', username: 'maksym', displayName: 'Maksym', avatarUrl: '/avatars/default.png' },
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
  fireEvent.change(screen.getByLabelText('Edit assignee'), { target: { value: 'maksym' } });
  fireEvent.change(screen.getByLabelText('Edit status'), { target: { value: 'IN_PROGRESS' } });
  fireEvent.click(screen.getByRole('button', { name: 'Save task' }));

  expect(await screen.findByText('Ready card')).toBeInTheDocument();
  expect(screen.getAllByText('Maksym').length).toBeGreaterThan(0);
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
        json: async () => [],
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
        status: 204,
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

test('a team member can move a task with explicit status controls', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'team-1', name: 'Platform', members: [], canManageMembership: false }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'task-1', title: 'Move board cards', description: null, status: 'TODO', assignee: null }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'task-1', title: 'Move board cards', description: null, status: 'IN_PROGRESS', assignee: null }),
      }),
  );

  renderBoard();
  await screen.findByText('Platform Board');
  fireEvent.change(screen.getByLabelText('Task title'), { target: { value: 'Move board cards' } });
  fireEvent.click(screen.getByRole('button', { name: 'Create task' }));
  fireEvent.click(await screen.findByRole('button', { name: 'Move Move board cards to In Progress' }));
  expect(await screen.findByText('No tasks in Todo.')).toBeInTheDocument();
  expect(screen.queryByText('No tasks in In Progress.')).not.toBeInTheDocument();
});

test('a team member can drag a task into another status column', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'team-1', name: 'Platform', members: [], canManageMembership: false }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'task-1', title: 'Drag board cards', description: null, status: 'TODO', assignee: null }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'task-1', title: 'Drag board cards', description: null, status: 'DONE', assignee: null }),
      }),
  );

  renderBoard();
  await screen.findByText('Platform Board');
  fireEvent.change(screen.getByLabelText('Task title'), { target: { value: 'Drag board cards' } });
  fireEvent.click(screen.getByRole('button', { name: 'Create task' }));

  const taskCard = (await screen.findByText('Drag board cards')).closest('article');
  const doneColumn = screen.getByLabelText('Done column');
  const dataTransfer = {
    taskId: '',
    setData(_type: string, taskId: string) {
      this.taskId = taskId;
    },
    getData() {
      return this.taskId;
    },
  };

  fireEvent.dragStart(taskCard!, { dataTransfer });
  fireEvent.dragOver(doneColumn, { dataTransfer });
  fireEvent.drop(doneColumn, { dataTransfer });
  expect(await screen.findByText('No tasks in Todo.')).toBeInTheDocument();
  expect(screen.queryByText('No tasks in Done.')).not.toBeInTheDocument();
});

test('a team member sees tasks loaded from the board API on page load', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 'team-1',
          name: 'Platform',
          canManageMembership: false,
          members: [{ id: 'user-1', email: 'loaded@example.com', username: 'loaded', displayName: 'Loaded User', avatarUrl: '/avatars/default.png' }],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [{
          id: 'task-1',
          title: 'Persisted task',
          description: null,
          status: 'TODO',
          assignee: { id: 'user-1', username: 'loaded', displayName: 'Loaded User', avatarUrl: '/avatars/default.png' },
        }],
      }),
  );

  renderBoard();

  expect(await screen.findByText('Persisted task')).toBeInTheDocument();
  expect(screen.queryByText('No tasks in Todo.')).not.toBeInTheDocument();
  expect(fetch).toHaveBeenCalledWith('/api/teams/team-1/tasks', expect.objectContaining({
    headers: expect.objectContaining({ Authorization: 'Bearer jwt-token' }),
  }));
});
