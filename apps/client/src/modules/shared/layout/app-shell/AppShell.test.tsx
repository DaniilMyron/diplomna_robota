import { fireEvent, render, screen } from '@testing-library/react';
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
});
