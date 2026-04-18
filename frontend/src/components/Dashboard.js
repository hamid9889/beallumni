import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FiHome, FiUsers, FiBriefcase, FiAward, FiHelpCircle, FiLogOut, FiMenu, FiX, FiUser } from 'react-icons/fi';
import Feed from './Feed';
import Alumni from './Alumni';
import Jobs from './Jobs';
import Placement from './Placement';
import AIAssistant from './AIAssistant';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...user });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile(formData);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8 border-b pb-8">
        <div className="flex items-center gap-6">
          <div className="relative group">
            {formData.profile_picture ? (
              <img 
                src={formData.profile_picture} 
                alt="Profile" 
                className="w-24 h-24 rounded-full object-cover border-4 border-blue-50"
              />
            ) : (
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-4xl font-bold border-4 border-blue-50">
                {user?.full_name?.charAt(0)}
              </div>
            )}
            {isEditing && (
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <p className="text-white text-xs font-bold">Change</p>
              </div>
            )}
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">{user?.full_name}</h2>
            <p className="text-gray-500">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className={`px-6 py-2 rounded-lg font-semibold transition-all ${
            isEditing ? 'bg-gray-100 text-gray-600' : 'bg-blue-600 text-white'
          }`}
        >
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-800 border-l-4 border-blue-600 pl-3">Personal Details</h3>
            
            <div>
              <label className="block text-sm font-semibold text-gray-500 mb-1">Full Name</label>
              <input
                type="text"
                disabled={!isEditing}
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg disabled:bg-gray-50 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-500 mb-1">Mobile Number</label>
              <input
                type="tel"
                disabled={!isEditing}
                value={formData.mobile_number}
                onChange={(e) => setFormData({ ...formData, mobile_number: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg disabled:bg-gray-50 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-500 mb-1">Gender</label>
              <select
                disabled={!isEditing}
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg disabled:bg-gray-50 focus:ring-2 focus:ring-blue-500"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-500 mb-1">Profile Picture URL</label>
              <input
                type="text"
                disabled={!isEditing}
                value={formData.profile_picture}
                onChange={(e) => setFormData({ ...formData, profile_picture: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg disabled:bg-gray-50 focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com/photo.jpg"
              />
            </div>
          </div>

          {/* Academic/Professional Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-800 border-l-4 border-blue-600 pl-3">Education & Career</h3>
            
            <div>
              <label className="block text-sm font-semibold text-gray-500 mb-1">College</label>
              <input
                type="text"
                disabled={!isEditing}
                value={formData.college}
                onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg disabled:bg-gray-50 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-500 mb-1">Course</label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={formData.course}
                  onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg disabled:bg-gray-50 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-500 mb-1">Branch</label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={formData.branch}
                  onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg disabled:bg-gray-50 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-500 mb-1">Current Year</label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={formData.current_year}
                  onChange={(e) => setFormData({ ...formData, current_year: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg disabled:bg-gray-50 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-500 mb-1">Passing Year</label>
                <input
                  type="number"
                  disabled={!isEditing}
                  value={formData.passing_year}
                  onChange={(e) => setFormData({ ...formData, passing_year: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg disabled:bg-gray-50 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-500 mb-1">Current Company</label>
              <input
                type="text"
                disabled={!isEditing}
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg disabled:bg-gray-50 focus:ring-2 focus:ring-blue-500"
                placeholder="Where do you work?"
              />
            </div>
          </div>
        </div>

        {isEditing && (
          <div className="flex justify-end pt-6 border-t">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-10 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-50"
            >
              {loading ? 'Saving Changes...' : 'Save All Changes'}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

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
    { id: 'profile', name: 'Profile', icon: FiUser },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'feed': return <Feed />;
      case 'alumni': return <Alumni />;
      case 'jobs': return <Jobs />;
      case 'placement': return <Placement />;
      case 'ai': return <AIAssistant />;
      case 'profile': return <Profile />;
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
              <div 
                className="text-right hidden sm:block cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => setActiveTab('profile')}
              >
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
