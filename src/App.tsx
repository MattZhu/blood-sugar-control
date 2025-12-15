import { useState } from 'react';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './features/dashboard/Dashboard';
import { LogEntry } from './features/log/LogEntry';
import { HistoryView } from './features/history/HistoryView';
import { SettingsView } from './features/settings/SettingsView';
import { TrendsView } from './features/trends/TrendsView';

type View = 'dashboard' | 'add' | 'trends' | 'history' | 'settings';

function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard');

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'add':
        return <LogEntry onComplete={() => setCurrentView('dashboard')} />;
      case 'trends':
        return <TrendsView />;
      case 'history':
        return <HistoryView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout currentView={currentView} onChangeView={(view) => setCurrentView(view as View)}>
      {renderView()}
    </Layout>
  );
}

export default App;
