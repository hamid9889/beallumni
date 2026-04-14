import React, { useState, useEffect } from 'react';
import { searchAlumni, connectAlumni, getConnections, sendMessage, getMessages } from '../api';
import { FiSearch, FiUserPlus, FiMessageSquare, FiX, FiSend } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';

const Alumni = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [alumni, setAlumni] = useState([]);
  const [connections, setConnections] = useState([]);
  const [activeView, setActiveView] = useState('search');
  const [chatUser, setChatUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    loadAlumni();
    loadConnections();
  }, []);

  useEffect(() => {
    if (chatUser) {
      loadMessages();
      const interval = setInterval(loadMessages, 3000); // Poll every 3 seconds
      return () => clearInterval(interval);
    }
  }, [chatUser]);

  const loadAlumni = async () => {
    try {
      const response = await searchAlumni(searchQuery);
      setAlumni(response.data);
    } catch (error) {
      console.error('Failed to load alumni:', error);
    }
  };

  const loadConnections = async () => {
    try {
      const response = await getConnections();
      setConnections(response.data);
    } catch (error) {
      console.error('Failed to load connections:', error);
    }
  };

  const handleConnect = async (userId) => {
    try {
      await connectAlumni(userId);
      alert('Connected successfully!');
      await loadConnections();
    } catch (error) {
      alert('Failed to connect');
    }
  };

  const loadMessages = async () => {
    if (!chatUser) return;
    try {
      const response = await getMessages(chatUser.id);
      setMessages(response.data);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !chatUser) return;

    try {
      await sendMessage(chatUser.id, newMessage);
      setNewMessage('');
      await loadMessages();
    } catch (error) {
      alert('Failed to send message');
    }
  };

  return (
    <div className="max-w-4xl mx-auto" data-testid="alumni-module">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">Alumni Network</h2>

      {/* View Toggle */}
      <div className="flex gap-2 mb-6">
        <button
          data-testid="search-view-tab"
          onClick={() => setActiveView('search')}
          className={`px-6 py-2 rounded-lg font-semibold transition-all ${
            activeView === 'search' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'
          }`}
        >
          Search Alumni
        </button>
        <button
          data-testid="connections-view-tab"
          onClick={() => setActiveView('connections')}
          className={`px-6 py-2 rounded-lg font-semibold transition-all ${
            activeView === 'connections' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'
          }`}
        >
          My Connections ({connections.length})
        </button>
      </div>

      {/* Search View */}
      {activeView === 'search' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="relative">
              <FiSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                data-testid="alumni-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && loadAlumni()}
                placeholder="Search by name, company, or skills..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              data-testid="search-alumni-button"
              onClick={loadAlumni}
              className="mt-3 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Search
            </button>
          </div>

          <div className="grid gap-4">
            {alumni.map((person) => (
              <div key={person.id} className="bg-white rounded-xl shadow-sm p-6" data-testid="alumni-card">
                <div className="flex items-start justify-between">
                  <div className="flex gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                      {person.full_name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{person.full_name}</h3>
                      <p className="text-sm text-gray-600">{person.email}</p>
                      {person.company && <p className="text-sm text-gray-600">{person.designation} at {person.company}</p>}
                      {person.bio && <p className="text-sm text-gray-500 mt-2">{person.bio}</p>}
                    </div>
                  </div>
                  <button
                    data-testid={`connect-button-${person.id}`}
                    onClick={() => handleConnect(person.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <FiUserPlus />
                    Connect
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Connections View */}
      {activeView === 'connections' && (
        <div className="grid gap-4">
          {connections.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl">
              <p className="text-gray-500">No connections yet. Start connecting with alumni!</p>
            </div>
          ) : (
            connections.map((person) => (
              <div key={person.id} className="bg-white rounded-xl shadow-sm p-6" data-testid="connection-card">
                <div className="flex items-start justify-between">
                  <div className="flex gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                      {person.full_name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{person.full_name}</h3>
                      <p className="text-sm text-gray-600">{person.email}</p>
                      {person.company && <p className="text-sm text-gray-600">{person.designation} at {person.company}</p>}
                    </div>
                  </div>
                  <button
                    data-testid={`chat-button-${person.id}`}
                    onClick={() => setChatUser(person)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <FiMessageSquare />
                    Chat
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Chat Modal */}
      {chatUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[600px] flex flex-col">
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                  {chatUser.full_name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{chatUser.full_name}</h3>
                  <p className="text-xs text-gray-500">Online</p>
                </div>
              </div>
              <button
                data-testid="close-chat-button"
                onClick={() => setChatUser(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3" data-testid="chat-messages">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.from_user_id === user?.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      msg.from_user_id === user?.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p>{msg.message}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {new Date(msg.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t">
              <div className="flex gap-2">
                <input
                  data-testid="chat-input"
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <button
                  data-testid="send-message-button"
                  type="submit"
                  className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <FiSend />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Alumni;
