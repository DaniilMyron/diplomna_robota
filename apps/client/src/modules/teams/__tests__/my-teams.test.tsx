import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { expect, test, vi } from 'vitest';
import { MyTeamsPage } from '../pages/MyTeamsPage';

vi.mock('@/modules/auth', () => ({
  useAuth: () => ({ token: 'jwt-token' }),
}));

test('a logged-in user sees an empty state and can create a team', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => [] })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ id: 'team-1', name: 'Platform' }) }),
  );

  render(
    <MemoryRouter>
      <MyTeamsPage />
    </MemoryRouter>,
  );

  expect(await screen.findByText(/No teams yet/i)).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('Team name'), { target: { value: 'Platform' } });
  fireEvent.click(screen.getByRole('button', { name: 'Create team' }));
  expect(await screen.findByText('Platform')).toBeInTheDocument();
  await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
});
