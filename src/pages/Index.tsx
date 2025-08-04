
import { useState } from 'react';
import Login from '@/components/Login';
import Dashboard from '@/pages/Dashboard';

const Index = () => {
  const [user, setUser] = useState<string | null>(null);

  const handleLogin = (username: string) => {
    setUser(username);
  };

  const handleLogout = () => {
    setUser(null);
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return <Dashboard username={user} onLogout={handleLogout} />;
};

export default Index;
