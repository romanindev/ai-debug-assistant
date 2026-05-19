import { useEffect, useState } from 'react';

import { AuthPage } from './features/auth/AuthPage';
import {
  useCurrentUserQuery,
  useLogoutMutation,
} from './features/auth/hooks/useAuthQueries';
import { DebugAssistantPage } from './features/debug/DebugAssistantPage';

export default function App() {
  const [path, setPath] = useState(() => window.location.pathname);
  const currentUserQuery = useCurrentUserQuery();
  const logoutMutation = useLogoutMutation();
  const currentUser = currentUserQuery.data?.user ?? null;

  useEffect(() => {
    function handlePopState() {
      setPath(window.location.pathname);
    }

    window.addEventListener('popstate', handlePopState);

    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  function navigate(nextPath: string) {
    window.history.pushState(null, '', nextPath);
    setPath(nextPath);
  }

  function handleLogout() {
    logoutMutation.mutate(undefined, {
      onSuccess: () => navigate('/'),
    });
  }

  if (path === '/login') {
    return <AuthPage mode="login" onNavigate={navigate} />;
  }

  if (path === '/register') {
    return <AuthPage mode="register" onNavigate={navigate} />;
  }

  return (
    <DebugAssistantPage
      currentUser={currentUser}
      isAuthLoading={currentUserQuery.isLoading}
      isLoggingOut={logoutMutation.isPending}
      onLogout={handleLogout}
      onNavigate={navigate}
    />
  );
}
