import React, { useState, useEffect } from 'react';
import { getPlacementQuestions, likePlacementQuestion, savePlacementQuestion, getSavedQuestions, submitPlacementExperience, getPlacementSubmissions } from '../api';
import { FiHeart, FiBookmark, FiFilter, FiSend } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';

const Placement = () => {
  const { user } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [savedQuestions, setSavedQuestions] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [activeView, setActiveView] = useState('questions');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterCompany, setFilterCompany] = useState('');
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [formData, setFormData] = useState({
    company: '',
    position: '',
    salary: '',
    experience: '',
    interview_process: '',
    tips: ''
  });

  useEffect(() => {
    loadQuestions();
    loadSavedQuestions();
    loadSubmissions();
  }, []);

  const loadQuestions = async () => {
    try {
      const response = await getPlacementQuestions(filterCategory, filterCompany);
      setQuestions(response.data);
    } catch (error) {
      console.error('Failed to load questions:', error);
    }
  };

  const loadSavedQuestions = async () => {
    try {
      const response = await getSavedQuestions();
      setSavedQuestions(response.data);
    } catch (error) {
      console.error('Failed to load saved questions:', error);
    }
  };

  const loadSubmissions = async () => {
    try {
      const response = await getPlacementSubmissions();
      setSubmissions(response.data);
    } catch (error) {
      console.error('Failed to load submissions:', error);
    }
  };

  const handleLike = async (questionId) => {
    try {
      await likePlacementQuestion(questionId);
      await loadQuestions();
    } catch (error) {
      console.error('Failed to like question:', error);
    }
  };

  const handleSave = async (questionId) => {
    try {
      await savePlacementQuestion(questionId);
      await loadQuestions();
      await loadSavedQuestions();
    } catch (error) {
      console.error('Failed to save question:', error);
    }
  };

  const handleSubmitExperience = async (e) => {
    e.preventDefault();
    try {
      await submitPlacementExperience(formData);
      alert('Experience submitted successfully!');
      setShowSubmitForm(false);
      setFormData({
        company: '',
        position: '',
        salary: '',
        experience: '',
        interview_process: '',
        tips: ''
      });
      await loadSubmissions();
    } catch (error) {
      alert('Failed to submit experience');
    }
  };

  const categories = ['Technical', 'HR', 'Aptitude', 'Group Discussion', 'Case Study'];

  return (
    <div className="max-w-5xl mx-auto" data-testid="placement-module">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">Placement Resources</h2>

      {/* View Toggle */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <button
          data-testid="questions-view-tab"
          onClick={() => setActiveView('questions')}
          className={`px-6 py-2 rounded-lg font-semibold transition-all ${
            activeView === 'questions' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'
          }`}
        >
          Questions
        </button>
        <button
          data-testid="saved-view-tab"
          onClick={() => setActiveView('saved')}
          className={`px-6 py-2 rounded-lg font-semibold transition-all ${
            activeView === 'saved' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'
          }`}
        >
          Saved ({savedQuestions.length})
        </button>
        <button
          data-testid="experiences-view-tab"
          onClick={() => setActiveView('experiences')}
          className={`px-6 py-2 rounded-lg font-semibold transition-all ${
            activeView === 'experiences' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'
          }`}
        >
          Experiences
        </button>
        <button
          data-testid="submit-experience-button"
          onClick={() => setShowSubmitForm(true)}
          className="px-6 py-2 rounded-lg font-semibold bg-green-600 text-white hover:bg-green-700 transition-colors"
        >
          Share Your Experience
        </button>
      </div>

      {/* Questions View */}
      {activeView === 'questions' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center gap-2 mb-3">
              <FiFilter />
              <h3 className="font-semibold text-gray-900">Filters</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  data-testid="category-filter"
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                <input
                  data-testid="company-filter"
                  type="text"
                  value={filterCompany}
                  onChange={(e) => setFilterCompany(e.target.value)}
                  placeholder="Search by company..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <button
              data-testid="apply-filters-button"
              onClick={loadQuestions}
              className="mt-3 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Apply Filters
            </button>
          </div>

          {/* Questions List */}
          <div className="space-y-4">
            {questions.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl">
                <p className="text-gray-500">No questions found</p>
              </div>
            ) : (
              questions.map((q) => (
                <div key={q.id} className="bg-white rounded-xl shadow-sm p-6" data-testid="question-card">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                          {q.category}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          q.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                          q.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {q.difficulty}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{q.title}</h3>
                      <p className="text-gray-700 mb-2">{q.description}</p>
                      <p className="text-sm text-gray-600">Company: <span className="font-semibold">{q.company}</span></p>
                      <p className="text-xs text-gray-500 mt-2">Posted by {q.posted_by_name}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 pt-4 border-t">
                    <button
                      data-testid={`like-question-button-${q.id}`}
                      onClick={() => handleLike(q.id)}
                      className={`flex items-center gap-2 transition-colors ${
                        q.likes?.includes(user?.id) ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                      }`}
                    >
                      <FiHeart className={q.likes?.includes(user?.id) ? 'fill-current' : ''} />
                      <span>{q.likes?.length || 0}</span>
                    </button>
                    <button
                      data-testid={`save-question-button-${q.id}`}
                      onClick={() => handleSave(q.id)}
                      className={`flex items-center gap-2 transition-colors ${
                        q.saved_by?.includes(user?.id) ? 'text-blue-500' : 'text-gray-500 hover:text-blue-500'
                      }`}
                    >
                      <FiBookmark className={q.saved_by?.includes(user?.id) ? 'fill-current' : ''} />
                      <span>{q.saved_by?.includes(user?.id) ? 'Saved' : 'Save'}</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Saved Questions View */}
      {activeView === 'saved' && (
        <div className="space-y-4">
          {savedQuestions.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl">
              <p className="text-gray-500">No saved questions yet</p>
            </div>
          ) : (
            savedQuestions.map((q) => (
              <div key={q.id} className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{q.title}</h3>
                <p className="text-gray-700 mb-2">{q.description}</p>
                <div className="flex gap-2">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">{q.category}</span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">{q.company}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Experiences View */}
      {activeView === 'experiences' && (
        <div className="space-y-4">
          {submissions.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl">
              <p className="text-gray-500">No experiences shared yet</p>
            </div>
          ) : (
            submissions.map((sub) => (
              <div key={sub.id} className="bg-white rounded-xl shadow-sm p-6" data-testid="experience-card">
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-gray-900">{sub.position} at {sub.company}</h3>
                  <p className="text-sm text-gray-600">by {sub.user_name} • Salary: {sub.salary}</p>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="font-semibold text-gray-900">Experience:</p>
                    <p className="text-gray-700">{sub.experience}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Interview Process:</p>
                    <p className="text-gray-700">{sub.interview_process}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Tips:</p>
                    <p className="text-gray-700">{sub.tips}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Submit Experience Modal */}
      {showSubmitForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Share Your Placement Experience</h2>

              <form onSubmit={handleSubmitExperience} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Company *</label>
                    <input
                      data-testid="experience-company-input"
                      type="text"
                      required
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Position *</label>
                    <input
                      data-testid="experience-position-input"
                      type="text"
                      required
                      value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Salary Package *</label>
                  <input
                    data-testid="experience-salary-input"
                    type="text"
                    required
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                    placeholder="e.g., 12 LPA"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your Experience *</label>
                  <textarea
                    data-testid="experience-text-input"
                    required
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                    rows="4"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Interview Process *</label>
                  <textarea
                    data-testid="interview-process-input"
                    required
                    value={formData.interview_process}
                    onChange={(e) => setFormData({ ...formData, interview_process: e.target.value })}
                    rows="4"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tips for Future Candidates *</label>
                  <textarea
                    data-testid="tips-input"
                    required
                    value={formData.tips}
                    onChange={(e) => setFormData({ ...formData, tips: e.target.value })}
                    rows="4"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    data-testid="submit-experience-form-button"
                    type="submit"
                    className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Submit
                  </button>
                  <button
                    data-testid="cancel-experience-button"
                    type="button"
                    onClick={() => setShowSubmitForm(false)}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Placement;
