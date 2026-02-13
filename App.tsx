import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { BottomNav } from './components/BottomNav';
import { Login } from './screens/Login';
import { Home } from './screens/Home';
import { InspectionScreen } from './screens/Inspection';
import { ChatScreen } from './screens/ChatAI';
import { HistoryScreen } from './screens/History';
import { ProfileScreen } from './screens/Profile';
import { P2HFormScreen } from './screens/P2HFormScreen';
import { ApprovalPage } from './screens/ApprovalPage';
import { ScreenName } from './types';

function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenName>('login');
  const [approvalToken, setApprovalToken] = useState<string>('');

  React.useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith('/approve/')) {
      const token = path.split('/approve/')[1];
      if (token) {
        setApprovalToken(token);
        setCurrentScreen('approval');
      }
    }
  }, []);

  // Helper to determine if we should show bottom nav
  const showBottomNav = !['login', 'p2h-form', 'approval'].includes(currentScreen);

  const handleViewInspection = (token: string) => {
    setApprovalToken(token);
    setCurrentScreen('approval');
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'login':
        return <Login onNavigate={setCurrentScreen} />;
      case 'home':
        return <Home onNavigate={setCurrentScreen} />;
      case 'inspection':
        return <InspectionScreen onNavigate={setCurrentScreen} onViewInspection={handleViewInspection} />;
      case 'p2h-form':
        return <P2HFormScreen onNavigate={setCurrentScreen} />;
      case 'approval':
        return <ApprovalPage token={approvalToken} onBack={() => setCurrentScreen('inspection')} />;
      case 'chat':
        return <ChatScreen />;
      case 'history':
        return <HistoryScreen onViewInspection={handleViewInspection} />;
      case 'profile':
        return <ProfileScreen onNavigate={setCurrentScreen} />;
      default:
        return <Login onNavigate={setCurrentScreen} />;
    }
  };

  return (
    <Layout>
      <main className="flex-1 overflow-y-auto relative no-scrollbar">
        {renderScreen()}
      </main>

      {showBottomNav && (
        <BottomNav
          currentScreen={currentScreen}
          onNavigate={setCurrentScreen}
        />
      )}
    </Layout>
  );
}

export default App;