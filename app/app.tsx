import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Header } from './components/Header';
import { DecisionTracker } from './components/DecisionTracker';
import { EmailViewer } from './components/EmailViewer';
import { NotesEditor } from './components/NotesEditor';
import { Tab } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('meeting');

  return (
    <div className="flex flex-col bg-base-100 min-h-screen">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="flex-1 overflow-auto">
        {activeTab === 'meeting' && <DecisionTracker />}
        {activeTab === 'emails' && <EmailViewer />}
        {activeTab === 'notes' && <NotesEditor />}
      </div>
    </div>
  );
};

createRoot(document.getElementById('root')!).render(<App />);
