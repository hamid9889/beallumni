import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FiHome, FiUsers, FiBriefcase, FiAward, FiHelpCircle, FiLogOut, FiMenu, FiX } from 'react-icons/fi';
import Feed from './Feed';
import Alumni from './Alumni';
import Jobs from './Jobs';
import Placement from './Placement';
import AIAssistant from './AIAssistant';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('feed');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const tabs = [
    { id: 'feed', name: 'Feed', icon: FiHome },
    { id: 'alumni', name: 'Alumni', icon: FiUsers },
    { id: 'jobs', name: 'Jobs', icon: FiBriefcase },
    { id: 'placement', name: 'Placement', icon: FiAward },
    { id: 'ai', name: 'AI Assistant', icon: FiHelpCircle },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'feed': return <Feed />;
      case 'alumni': return <Alumni />;
      case 'jobs': return <Jobs />;
      case 'placement': return <Placement />;
      case 'ai': return <AIAssistant />;
      default: return <Feed />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" data-testid="dashboard">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
              >
                {sidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Alumni Connect</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-gray-900">{user?.full_name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <button
                data-testid="logout-button"
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <FiLogOut />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex max-w-7xl mx-auto">
        {/* Sidebar */}
        <aside className={`
          fixed lg:sticky top-[73px] left-0 h-[calc(100vh-73px)] bg-white border-r w-64 z-30 transition-transform duration-300
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <nav className="p-4 space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  data-testid={`${tab.id}-tab`}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          />
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
