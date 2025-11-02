// Fix: Implemented the Header component.
import React from 'react';
import { User } from '../types.ts';

interface HeaderProps {
  user: User;
  currentView: 'dashboard' | 'list' | 'admin';
  onSetView: (view: 'dashboard' | 'list' | 'admin') => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, currentView, onSetView, onLogout }) => {
  const NavButton: React.FC<{ view: 'dashboard' | 'list' | 'admin', children: React.ReactNode }> = ({ view, children }) => {
      const isActive = currentView === view;
      return (
          <button 
              onClick={() => onSetView(view)} 
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${isActive ? 'bg-brand-primary/10 text-brand-primary' : 'text-slate-500 hover:bg-slate-200/50'}`}>
              {children}
          </button>
      )
  };

  return (
    <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <div className="flex-shrink-0">
                <h1 className="text-xl font-bold text-brand-primary">AI RMS</h1>
            </div>
            <nav className="hidden md:flex space-x-2">
                <NavButton view="dashboard">Dashboard</NavButton>
                <NavButton view="list">All Candidates</NavButton>
                {user.isAdmin && <NavButton view="admin">Admin</NavButton>}
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-slate-600 hidden sm:block">Welcome, {user.username}</span>
            <button
              onClick={onLogout}
              className="px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};