import React from 'react';
import { Tab } from '../types';
import { CalendarDays, Mail, FileText } from 'lucide-react';

interface HeaderProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, onTabChange }) => {
  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'meeting', label: 'Strategy', icon: <CalendarDays size={15} /> },
    { id: 'emails', label: 'Emails', icon: <Mail size={15} /> },
    { id: 'notes', label: 'Meeting Notes', icon: <FileText size={15} /> },
  ];

  return (
    <div className="bg-base-200 border-b border-base-300 px-4 pt-4 pb-0">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 rounded-full bg-success flex items-center justify-center text-success-content text-xs font-bold">
          DPI
        </div>
        <div>
          <h1 className="text-base font-bold text-base-content leading-tight">Dental Profits Institute</h1>
          <p className="text-xs text-base-content/50">Campaign Hub — GenieRocket</p>
        </div>
      </div>
      <div className="tabs tabs-bordered">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab gap-1.5 text-sm ${activeTab === tab.id ? 'tab-active font-semibold' : 'text-base-content/60'}`}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};
