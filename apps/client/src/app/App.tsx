import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthPage, AuthProvider, RequireAuth } from '@/modules/auth';
import { TaskDetailPage, TeamBoardPage } from '@/modules/board';
import { ProfilePage, SettingsPage } from '@/modules/account';
import { AppShell } from '@/modules/shared/layout/app-shell/AppShell';
import { MyTeamsPage } from '@/modules/teams';
import { MyTasksPage } from '@/modules/tasks';

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
            <Route path="/tasks" element={<MyTasksPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/teams/:teamId/board" element={<TeamBoardPage />} />
            <Route path="/teams/:teamId/tasks/:taskId" element={<TaskDetailPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
