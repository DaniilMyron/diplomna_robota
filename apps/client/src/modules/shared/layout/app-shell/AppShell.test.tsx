import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { expect, test, vi } from 'vitest';
import { AppShell } from './AppShell';

vi.mock('@/modules/auth', () => ({
  useAuth: () => ({
    token: 'jwt-token',
    user: {
      id: 'user-1',
      displayName: 'Dmytro',
      avatarUrl: '/avatar.png',
    },
    logout: vi.fn(),
  }),
}));

function CurrentPath() {
  const location = useLocation();

  return <p>{location.pathname}</p>;
}

test('an authenticated user sees accessible boards grouped by team and can navigate to one', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [
        { id: 'team-1', name: 'Platform' },
        { id: 'team-2', name: 'Design' },
      ],
    }),
  );

  render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<CurrentPath />} />
          <Route path="/teams/:teamId/board" element={<CurrentPath />} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );

  fireEvent.click(screen.getByText('Boards'));

  expect(await screen.findByRole('heading', { name: 'Platform' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Design' })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('link', { name: 'Platform Board' }));
  expect(screen.getByText('/teams/team-1/board')).toBeInTheDocument();
  expect(screen.queryByRole('link', { name: 'Platform Board' })).not.toBeInTheDocument();
});

test('the boards menu closes when the user clicks outside it', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [{ id: 'team-1', name: 'Platform' }],
    }),
  );

  render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<CurrentPath />} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );

  fireEvent.click(screen.getByRole('button', { name: 'Boards' }));
  expect(await screen.findByRole('link', { name: 'Platform Board' })).toBeInTheDocument();

  fireEvent.mouseDown(document.body);

  await waitFor(() => expect(screen.queryByRole('link', { name: 'Platform Board' })).not.toBeInTheDocument());
});

test('the boards menu refreshes when teams change elsewhere in the shell', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => [] })
      .mockResolvedValueOnce({ ok: true, json: async () => [{ id: 'team-1', name: 'Platform' }] }),
  );

  render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<CurrentPath />} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );

  fireEvent.click(screen.getByRole('button', { name: 'Boards' }));
  expect(await screen.findByText('Create a team to unlock its board.')).toBeInTheDocument();

  window.dispatchEvent(new Event('teams:changed'));

  expect(await screen.findByRole('link', { name: 'Platform Board' })).toBeInTheDocument();
});
