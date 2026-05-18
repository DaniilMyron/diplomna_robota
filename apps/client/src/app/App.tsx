import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthPage, AuthProvider, RequireAuth } from '@/modules/auth';
import { TeamBoardPage } from '@/modules/board';
import { AppShell } from '@/modules/shared/layout/app-shell/AppShell';
import { MyTeamsPage } from '@/modules/teams';

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route
            element={
              <RequireAuth>
                <AppShell />
              </RequireAuth>
            }
          >
            <Route path="/" element={<MyTeamsPage />} />
            <Route path="/teams/:teamId/board" element={<TeamBoardPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
