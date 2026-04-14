import React, { useState, useEffect } from 'react';
import { askAI, getAIHistory } from '../api';
import { FiSend, FiClock } from 'react-icons/fi';

const AIAssistant = () => {
  const [question, setQuestion] = useState('');
  const [context, setContext] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const response = await getAIHistory();
      setHistory(response.data);
    } catch (error) {
      console.error('Failed to load AI history:', error);
    }
  };

  const handleAsk = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    setAnswer('');

    try {
      const response = await askAI(question, context);
      setAnswer(response.data.answer);
      setQuestion('');
      setContext('');
      await loadHistory();
    } catch (error) {
      setAnswer('Sorry, I encountered an error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto" data-testid="ai-assistant-module">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">AI Assistant</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chat Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Ask Question Form */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Ask Me Anything</h3>
            <form onSubmit={handleAsk} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Question *</label>
                <textarea
                  data-testid="ai-question-input"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  required
                  rows="3"
                  placeholder="e.g., How should I prepare for a technical interview at Google?"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Additional Context (Optional)</label>
                <textarea
                  data-testid="ai-context-input"
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  rows="2"
                  placeholder="Provide any additional details that might help..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <button
                data-testid="ask-ai-button"
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Thinking...</span>
                  </>
                ) : (
                  <>
                    <FiSend />
                    <span>Ask AI</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Answer Display */}
          {answer && (
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl shadow-sm p-6" data-testid="ai-answer">
              <h3 className="text-xl font-bold text-gray-900 mb-4">AI Response</h3>
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{answer}</p>
              </div>
            </div>
          )}
        </div>

        {/* History Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
            <div className="flex items-center gap-2 mb-4">
              <FiClock />
              <h3 className="text-lg font-bold text-gray-900">Recent Questions</h3>
            </div>

            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {history.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No history yet</p>
              ) : (
                history.slice(0, 10).map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => {
                      setQuestion(item.question);
                      setAnswer(item.answer);
                    }}
                    data-testid="history-item"
                  >
                    <p className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2">
                      {item.question}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(item.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Help Section */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="font-bold text-blue-900 mb-3">💡 Suggested Topics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
          <button
            onClick={() => setQuestion('How do I prepare for coding interviews?')}
            className="text-left p-2 bg-white rounded-lg hover:bg-blue-100 transition-colors"
          >
            • Coding interview preparation
          </button>
          <button
            onClick={() => setQuestion('What are common HR interview questions?')}
            className="text-left p-2 bg-white rounded-lg hover:bg-blue-100 transition-colors"
          >
            • HR interview questions
          </button>
          <button
            onClick={() => setQuestion('How to write a good resume?')}
            className="text-left p-2 bg-white rounded-lg hover:bg-blue-100 transition-colors"
          >
            • Resume writing tips
          </button>
          <button
            onClick={() => setQuestion('What skills are most in demand?')}
            className="text-left p-2 bg-white rounded-lg hover:bg-blue-100 transition-colors"
          >
            • In-demand skills
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
